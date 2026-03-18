'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import {
  IconBook,
  IconBookmark,
  IconBookmarkFilled,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarLeftCollapse,
  IconUpload,
  IconTrash,
  IconMessagePlus,
  IconMessage,
  IconX,
  IconEdit,
  IconCheck,
  IconAlertCircle,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/app/context/AuthContext';
import { ebookRepository } from '@/app/lib/ebookRepository';
import { parseDocxToPages } from '@/app/lib/docxParser';
import { parsePdfToPages } from '@/app/lib/pdfParser';

// ── Color map for highlights ──────────────────────────────────────────────────
const COLOR_MAP = {
  yellow: { bg: '#FFF9C4', border: '#F9A825' },
  green:  { bg: '#C8E6C9', border: '#388E3C' },
  blue:   { bg: '#BBDEFB', border: '#1976D2' },
  pink:   { bg: '#F8BBD0', border: '#C2185B' },
  orange: { bg: '#FFE0B2', border: '#E65100' },
};

const HIGHLIGHT_COLORS = [
  { value: 'yellow', bg: '#FDD835', label: 'Vàng' },
  { value: 'green',  bg: '#43A047', label: 'Xanh lá' },
  { value: 'blue',   bg: '#1E88E5', label: 'Xanh dương' },
  { value: 'pink',   bg: '#E91E63', label: 'Hồng' },
  { value: 'orange', bg: '#FB8C00', label: 'Cam' },
];

// ── Build segments for a single paragraph (local offsets 0..para.length) ─────
function buildParaSegments(para, paraStart, highlights, comments) {
  // Adjust highlight/comment offsets to be local to this paragraph
  const local = (items) => items
    .filter(x => x.endOffset > paraStart && x.startOffset < paraStart + para.length)
    .map(x => ({
      ...x,
      startOffset: Math.max(0, x.startOffset - paraStart),
      endOffset: Math.min(para.length, x.endOffset - paraStart),
    }));

  const lh = local(highlights);
  const lc = local(comments);

  if (lh.length === 0 && lc.length === 0) return [{ text: para, highlight: null, comment: null }];

  const pts = new Set([0, para.length]);
  [...lh, ...lc].forEach(x => { pts.add(x.startOffset); pts.add(x.endOffset); });
  const sorted = [...pts].sort((a, b) => a - b);

  return sorted.slice(0, -1).map((start, i) => {
    const end = sorted[i + 1];
    return {
      text: para.slice(start, end),
      highlight: lh.find(h => h.startOffset <= start && h.endOffset >= end) || null,
      comment: lc.find(c => c.startOffset <= start && c.endOffset >= end) || null,
    };
  }).filter(s => s.text.length > 0);
}

// ── EbookPageContent ──────────────────────────────────────────────────────────
function EbookPageContent({ pageNumber, text, highlights, comments, onTextSelection, fontSize = 17 }) {
  const paragraphs = useMemo(() => {
    let offset = 0;
    return text.split('\n\n').filter(p => p.trim()).map(para => {
      const idx = text.indexOf(para, offset);
      offset = idx + para.length + 2;
      return { text: para, start: idx };
    });
  }, [text]);

  const renderSegment = (seg, i) => {
    if (seg.comment) {
      const colors = COLOR_MAP[seg.highlight?.color || 'yellow'] || COLOR_MAP.yellow;
      return (
        <span key={i} title={seg.comment.content} style={{ backgroundColor: colors.bg, borderBottom: `2px solid ${colors.border}`, borderRadius: 2, cursor: 'pointer' }}>
          {seg.text}<span style={{ fontSize: '0.7em', verticalAlign: 'super', marginLeft: 1 }}>💬</span>
        </span>
      );
    }
    if (seg.highlight) {
      const colors = COLOR_MAP[seg.highlight.color] || COLOR_MAP.yellow;
      return <span key={i} style={{ backgroundColor: colors.bg, borderBottom: `2px solid ${colors.border}`, borderRadius: 2 }}>{seg.text}</span>;
    }
    return <span key={i}>{seg.text}</span>;
  };

  return (
    <Box
      id={`page-content-${pageNumber}`}
      onMouseUp={() => onTextSelection(pageNumber)}
      onTouchEnd={() => onTextSelection(pageNumber)}
      sx={{ fontFamily: '"Segoe UI", system-ui, sans-serif', fontSize: `${fontSize}px`, lineHeight: 2, color: 'text.primary', userSelect: 'text' }}
    >
      {paragraphs.map((item, i) => {
        const segs = buildParaSegments(item.text, item.start, highlights, comments);
        return (
          <Typography key={i} component="p" sx={{ mb: 2.5, fontFamily: '"Segoe UI", system-ui, sans-serif', fontSize: `${fontSize}px`, lineHeight: 2 }}>
            {segs.map(renderSegment)}
          </Typography>
        );
      })}
    </Box>
  );
}

// ── SelectionToolbar ──────────────────────────────────────────────────────────
function SelectionToolbar({ selection, onHighlight, onAddComment, onClose }) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!selection?.range) return;
    setShowCommentInput(false);
    setCommentText('');

    const rect = selection.range.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY - 60,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, [selection]);

  if (!selection) return null;

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
    setShowCommentInput(false);
  };

  return (
    <Paper
      id="ebook-selection-toolbar"
      elevation={8}
      sx={{
        position: 'fixed',
        zIndex: 1500,
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        bgcolor: '#1a1a2e',
        color: 'white',
        borderRadius: 2,
        p: 1.5,
        minWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 0.5, display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        &ldquo;{selection.text.slice(0, 50)}{selection.text.length > 50 ? '…' : ''}&rdquo;
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {HIGHLIGHT_COLORS.map(c => (
            <Tooltip key={c.value} title={`Highlight ${c.label}`}>
              <Box
                component="button"
                onClick={() => onHighlight(c.value)}
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: c.bg,
                  border: '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.25)', borderColor: 'white' },
                }}
              />
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(255,255,255,0.2)' }} />

        <Button
          size="small"
          startIcon={<IconMessagePlus size={13} />}
          onClick={() => setShowCommentInput(v => !v)}
          sx={{ color: 'white', textTransform: 'none', fontSize: '0.7rem', px: 1, py: 0.5, minWidth: 'auto', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'primary.main' } }}
        >
          Ghi chú
        </Button>

        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)', ml: 'auto', '&:hover': { color: 'white' } }}>
          <IconX size={14} />
        </IconButton>
      </Box>

      {showCommentInput && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <textarea
            autoFocus
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Nhập ghi chú..."
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(); }}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '0.75rem',
              borderRadius: 6,
              padding: '6px 8px',
              resize: 'none',
              outline: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              minHeight: 60,
              fontFamily: 'inherit',
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Ctrl+Enter để lưu</Typography>
            <Button
              size="small"
              disabled={!commentText.trim()}
              onClick={handleComment}
              sx={{ textTransform: 'none', fontSize: '0.7rem', px: 1.5, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { opacity: 0.4 } }}
            >
              Lưu
            </Button>
          </Box>
        </Box>
      )}

      {/* Arrow */}
      <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '100%', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #1a1a2e' }} />
    </Paper>
  );
}

// ── EbookSidebarPanel ─────────────────────────────────────────────────────────
function EbookSidebarPanel({ bookmarks, comments, currentPage, onGoToPage, onDeleteBookmark, onDeleteComment, onUpdateComment }) {
  const [activeTab, setActiveTab] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const sortedBookmarks = [...bookmarks].sort((a, b) => a.pageNumber - b.pageNumber);
  const sortedComments = [...comments].sort((a, b) => a.pageNumber - b.pageNumber || a.startOffset - b.startOffset);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 44 }}>
        <Tab
          icon={<IconBookmark size={14} />}
          iconPosition="start"
          label={`Bookmark (${bookmarks.length})`}
          sx={{ minHeight: 44, fontSize: '0.75rem', textTransform: 'none' }}
        />
        <Tab
          icon={<IconMessage size={14} />}
          iconPosition="start"
          label={`Ghi chú (${comments.length})`}
          sx={{ minHeight: 44, fontSize: '0.75rem', textTransform: 'none' }}
        />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {activeTab === 0 && (
          <>
            {sortedBookmarks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <IconBookmark size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                <Typography variant="body2" color="text.secondary">Chưa có bookmark</Typography>
                <Typography variant="caption" color="text.secondary">Nhấn 🔖 để đánh dấu trang</Typography>
              </Box>
            )}
            {sortedBookmarks.map(b => (
              <Box
                key={b.id}
                onClick={() => onGoToPage(b.pageNumber)}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 1.25, borderRadius: 1.5, cursor: 'pointer', mb: 0.5,
                  border: 1,
                  borderColor: b.pageNumber === currentPage ? 'primary.light' : 'transparent',
                  bgcolor: b.pageNumber === currentPage ? 'primary.lighter' : 'transparent',
                  '&:hover': { bgcolor: b.pageNumber === currentPage ? 'primary.lighter' : 'action.hover' },
                  '&:hover .delete-btn': { opacity: 1 },
                  '.delete-btn': { opacity: 0, transition: 'opacity 0.15s' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconBookmarkFilled size={14} color={b.pageNumber === currentPage ? '#1976D2' : '#9e9e9e'} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{b.label}</Typography>
                    <Typography variant="caption" color="text.secondary">Trang {b.pageNumber}</Typography>
                  </Box>
                </Box>
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={e => { e.stopPropagation(); onDeleteBookmark(b.id); }}
                  sx={{ color: 'error.main' }}
                >
                  <IconTrash size={13} />
                </IconButton>
              </Box>
            ))}
          </>
        )}

        {activeTab === 1 && (
          <>
            {sortedComments.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <IconMessage size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                <Typography variant="body2" color="text.secondary">Chưa có ghi chú</Typography>
                <Typography variant="caption" color="text.secondary">Chọn text rồi nhấn &quot;Ghi chú&quot;</Typography>
              </Box>
            )}
            {sortedComments.map(c => (
              <Box
                key={c.id}
                onClick={() => onGoToPage(c.pageNumber)}
                sx={{
                  p: 1.5, borderRadius: 1.5, border: 1, cursor: 'pointer', mb: 1,
                  borderColor: c.pageNumber === currentPage ? 'warning.light' : 'divider',
                  bgcolor: c.pageNumber === currentPage ? 'warning.lighter' : 'transparent',
                  '&:hover': { bgcolor: c.pageNumber === currentPage ? 'warning.lighter' : 'action.hover' },
                  '&:hover .comment-actions': { opacity: 1 },
                  '.comment-actions': { opacity: 0, transition: 'opacity 0.15s' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">Trang {c.pageNumber}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}>
                      &ldquo;{c.selectedText}&rdquo;
                    </Typography>

                    {editingId === c.id ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={3}
                          onClick={e => e.stopPropagation()}
                          style={{ width: '100%', fontSize: '0.85rem', borderRadius: 4, padding: '4px 8px', resize: 'none', border: '1px solid #1976D2', outline: 'none', fontFamily: 'inherit' }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            startIcon={<IconCheck size={11} />}
                            onClick={e => { e.stopPropagation(); onUpdateComment(c.id, editText); setEditingId(null); }}
                            sx={{ textTransform: 'none', fontSize: '0.7rem', px: 1, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                          >
                            Lưu
                          </Button>
                          <Button
                            size="small"
                            startIcon={<IconX size={11} />}
                            onClick={e => { e.stopPropagation(); setEditingId(null); }}
                            sx={{ textTransform: 'none', fontSize: '0.7rem', px: 1 }}
                          >
                            Hủy
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2">{c.content}</Typography>
                    )}
                  </Box>

                  {editingId !== c.id && (
                    <Box className="comment-actions" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={e => { e.stopPropagation(); setEditingId(c.id); setEditText(c.content); }}
                        sx={{ color: 'primary.main' }}
                      >
                        <IconEdit size={13} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={e => { e.stopPropagation(); onDeleteComment(c.id); }}
                        sx={{ color: 'error.main' }}
                      >
                        <IconTrash size={13} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}

// ── UploadPage ────────────────────────────────────────────────────────────────
function UploadPage({ books, onUpload, onOpenBook, onDeleteBook, loading, loadingBookId, openError }) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.docx') || name.endsWith('.pdf')) onUpload(file);
  }, [onUpload]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'grey.50' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 3, py: 5 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main', mb: 2, boxShadow: 3 }}>
            <IconBook size={28} color="white" />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>Đọc Sách</Typography>
          <Typography variant="body2" color="text.secondary">
            Tải file Word (.docx) hoặc PDF để bắt đầu đọc với highlight &amp; ghi chú
          </Typography>
        </Box>

        {/* Drop zone */}
        <Box
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('ebook-file-input')?.click()}
          sx={{
            position: 'relative',
            borderRadius: 3,
            border: '2px dashed',
            borderColor: dragging ? 'primary.main' : 'primary.light',
            p: 5,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            bgcolor: dragging ? 'primary.lighter' : 'background.paper',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.50' },
          }}
        >
          <input
            id="ebook-file-input"
            type="file"
            accept=".docx,.pdf"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={36} />
              <Typography color="primary" fontWeight={500}>Đang xử lý file...</Typography>
            </Box>
          ) : (
            <>
              <IconUpload size={36} style={{ margin: '0 auto 12px', display: 'block', color: '#1976D2' }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>Kéo thả file vào đây</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                hoặc <span style={{ color: '#1976D2', textDecoration: 'underline' }}>click để chọn file</span>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Hỗ trợ <strong>.docx</strong> và <strong>.pdf</strong>
              </Typography>
              <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                {['🎨 Highlight 5 màu', '💬 Ghi chú inline', '🔖 Đánh dấu trang', '📍 Nhớ vị trí đọc'].map(f => (
                  <Chip key={f} label={f} size="small" variant="outlined" />
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Open error */}
        {openError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => {}}>
            {openError}
          </Alert>
        )}

        {/* Saved books */}
        {books.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Sách đã lưu</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {books.map(book => {
                const isLoading = loadingBookId === book.id;
                return (
                  <Card
                    key={book.id}
                    variant="outlined"
                    onClick={() => !isLoading && onOpenBook(book)}
                    sx={{
                      cursor: isLoading ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: loadingBookId && !isLoading ? 0.5 : 1,
                      borderColor: isLoading ? 'primary.main' : undefined,
                      '&:hover': { borderColor: isLoading ? 'primary.main' : 'primary.main', boxShadow: 1 },
                      '&:hover .book-delete': { opacity: 1 },
                      '.book-delete': { opacity: 0, transition: 'opacity 0.15s' },
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
                      <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isLoading ? 'primary.main' : 'primary.lighter', borderRadius: 1.5, flexShrink: 0 }}>
                        {isLoading
                          ? <CircularProgress size={18} sx={{ color: 'white' }} />
                          : <IconBook size={18} color="#1976D2" />
                        }
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>{book.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isLoading ? 'Đang tải...' : `${book.totalPages} trang · ${new Date(book.uploadedAt).toLocaleDateString('vi-VN')}`}
                        </Typography>
                      </Box>
                      {!isLoading && (
                        <IconButton
                          className="book-delete"
                          size="small"
                          onClick={e => { e.stopPropagation(); onDeleteBook(book.id); }}
                          sx={{ color: 'error.main' }}
                          title="Xóa sách"
                        >
                          <IconTrash size={15} />
                        </IconButton>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── EbookReader ───────────────────────────────────────────────────────────────
function EbookReader() {
  const { user } = useAuth();
  const userId = user?.userId || '';

  const [activeBook, setActiveBook] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Default sidebar closed on mobile (after hydration)
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);
  const [jumpPage, setJumpPage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);
  const readerRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    setSupportsFullscreen(!!document.documentElement.requestFullscreen);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Books list
  const [savedBooks, setSavedBooks] = useState([]);
  const [loadingBookId, setLoadingBookId] = useState(null);
  const [openBookError, setOpenBookError] = useState(null);

  useEffect(() => {
    ebookRepository.getBooks().then(books => setSavedBooks(books || [])).catch(() => {});
  }, []);

  // Font size + dynamic pagination
  const [fontSize, setFontSize] = useState(17);

  // Re-paginate fullText whenever fontSize changes
  const displayPages = useMemo(() => {
    if (!activeBook) return [];
    const fullText = activeBook.pages.join('\n\n');
    const wordsPerPage = Math.round(400 * (17 / fontSize));
    const paragraphs = fullText.split('\n\n').filter(p => p.trim());
    const pages = [];
    let cur = [], wc = 0;
    for (const para of paragraphs) {
      const pw = para.split(/\s+/).length;
      if (wc + pw > wordsPerPage && cur.length > 0) {
        pages.push(cur.join('\n\n'));
        cur = [para]; wc = pw;
      } else { cur.push(para); wc += pw; }
    }
    if (cur.length > 0) pages.push(cur.join('\n\n'));
    return pages.length > 0 ? pages : [''];
  }, [activeBook, fontSize]);

  const totalPages = displayPages.length;

  // Reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [highlights, setHighlights] = useState([]);
  const [comments, setComments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selection, setSelection] = useState(null);
  const [readerLoading, setReaderLoading] = useState(false);
  const [error, setError] = useState(null);
  const saveProgressTimer = useRef(null);

  // Load book data when activeBook changes
  useEffect(() => {
    if (!activeBook) return;
    setReaderLoading(true);
    setError(null);
    Promise.all([
      ebookRepository.getHighlights(activeBook.id),
      ebookRepository.getComments(activeBook.id),
      ebookRepository.getBookmarks(activeBook.id),
      ebookRepository.getProgress(activeBook.id),
    ]).then(([h, c, b, p]) => {
      setHighlights(h || []);
      setComments(c || []);
      setBookmarks(b || []);
      if (p && p.currentPage) setCurrentPage(p.currentPage);
      else setCurrentPage(1);
      setReaderLoading(false);
    }).catch(() => {
      setError('Không thể tải dữ liệu sách.');
      setReaderLoading(false);
    });
  }, [activeBook]);

  // Auto-save progress (debounced)
  useEffect(() => {
    if (!activeBook) return;
    if (saveProgressTimer.current) clearTimeout(saveProgressTimer.current);
    saveProgressTimer.current = setTimeout(() => {
      ebookRepository.saveProgress(null, activeBook.id, currentPage).catch(() => {});
    }, 1000);
  }, [currentPage, activeBook]);

  const goToPage = useCallback((page) => {
    if (!activeBook) return;
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [activeBook, totalPages]);

  const handleTextSelection = useCallback((pageNumber) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null);
      return;
    }
    const text = sel.toString().trim();
    const range = sel.getRangeAt(0);
    const container = document.getElementById(`page-content-${pageNumber}`);
    if (!container) return;

    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preRange.toString().length;
    const endOffset = startOffset + text.length;

    setSelection({ text, startOffset, endOffset, pageNumber, range: range.cloneRange() });
  }, []);

  const addHighlight = useCallback(async (color) => {
    if (!selection || !activeBook) return;
    try {
      const h = await ebookRepository.addHighlight(
        null, activeBook.id, selection.pageNumber,
        selection.startOffset, selection.endOffset, selection.text, color,
      );
      setHighlights(prev => [...prev, h]);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } catch {
      setError('Không thể lưu highlight.');
    }
  }, [selection, activeBook, userId]);

  const addComment = useCallback(async (content) => {
    if (!selection || !activeBook) return;
    try {
      const c = await ebookRepository.addComment(
        null, activeBook.id, selection.pageNumber,
        selection.startOffset, selection.endOffset, selection.text, content,
      );
      setComments(prev => [...prev, c]);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } catch {
      setError('Không thể lưu ghi chú.');
    }
  }, [selection, activeBook, userId]);

  const updateComment = useCallback(async (id, content) => {
    try {
      const updated = await ebookRepository.updateComment(id, content);
      setComments(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      setError('Không thể cập nhật ghi chú.');
    }
  }, []);

  const deleteComment = useCallback(async (id) => {
    try {
      await ebookRepository.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Không thể xóa ghi chú.');
    }
  }, []);

  const toggleBookmark = useCallback(async () => {
    if (!activeBook) return;
    try {
      const result = await ebookRepository.addBookmark(null, activeBook.id, currentPage, `Trang ${currentPage}`);
      if (result && result.removed) {
        setBookmarks(prev => prev.filter(b => b.pageNumber !== currentPage));
      } else if (result && result.id) {
        setBookmarks(prev => [...prev.filter(b => b.pageNumber !== currentPage), result]);
      }
    } catch { setError('Không thể cập nhật bookmark.'); }
  }, [activeBook, currentPage]);

  const isBookmarked = bookmarks.some(b => b.pageNumber === currentPage);
  const pageHighlights = highlights.filter(h => h.pageNumber === currentPage);
  const pageComments = comments.filter(c => c.pageNumber === currentPage);

  // Upload handler
  const handleUpload = useCallback(async (file) => {
    setUploading(true);
    try {
      let pages;
      if (file.name.toLowerCase().endsWith('.pdf')) {
        pages = await parsePdfToPages(file);
      } else {
        pages = await parseDocxToPages(file);
      }
      const title = file.name.replace(/\.(docx|pdf)$/i, '');
      const book = await ebookRepository.saveBook(null, title, pages);
      setSavedBooks(prev => [...prev, book]);
      setActiveBook(book);
    } catch (e) {
      setError(`Không thể đọc file: ${e?.message || 'Hãy kiểm tra lại định dạng .docx hoặc .pdf'}`);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDeleteBook = useCallback(async (id) => {
    try {
      await ebookRepository.deleteBook(id);
      setSavedBooks(prev => prev.filter(b => b.id !== id));
      if (activeBook?.id === id) setActiveBook(null);
    } catch { setError('Không thể xóa sách.'); }
  }, [activeBook]);

  // Keyboard navigation
  useEffect(() => {
    if (!activeBook) return;
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(currentPage + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(currentPage - 1);
      if (e.key === 'b') toggleBookmark();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeBook, currentPage, goToPage, toggleBookmark, toggleFullscreen]);

  // Close toolbar on outside click
  useEffect(() => {
    const handler = (e) => {
      const toolbar = document.getElementById('ebook-selection-toolbar');
      if (toolbar && !toolbar.contains(e.target)) {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) setSelection(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenBook = useCallback(async (bookOrMeta) => {
    if (bookOrMeta.pages) {
      setActiveBook(bookOrMeta);
    } else {
      setLoadingBookId(bookOrMeta.id);
      setOpenBookError(null);
      try {
        const full = await ebookRepository.getBook(bookOrMeta.id);
        if (!full) throw new Error('Không tìm thấy sách.');
        setActiveBook(full);
      } catch (e) {
        setOpenBookError(e?.message || 'Không thể tải sách. Vui lòng thử lại.');
      } finally {
        setLoadingBookId(null);
      }
    }
  }, []);

  // Upload / library view
  if (!activeBook) {
    return (
      <UploadPage
        books={savedBooks}
        onUpload={handleUpload}
        onOpenBook={handleOpenBook}
        onDeleteBook={handleDeleteBook}
        loading={uploading}
        loadingBookId={loadingBookId}
        openError={openBookError}
      />
    );
  }

  const currentText = displayPages[currentPage - 1] || '';
  const progress = Math.round((currentPage / totalPages) * 100);

  return (
    <Box ref={readerRef} sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f5f0e8', position: 'relative', overflowX: 'hidden', ...(isFullscreen && { position: 'fixed', inset: 0, zIndex: 9999, height: '100vh' }) }}>
      {/* Top bar */}
      <Box sx={{ display: isFullscreen ? 'none' : 'flex', alignItems: 'center', gap: 1, px: 2, height: 56, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 1200, flexShrink: 0 }}>
        <IconButton size="small" onClick={() => setSidebarOpen(v => !v)} title={sidebarOpen ? 'Ẩn sidebar' : 'Mở sidebar'}>
          {sidebarOpen ? <IconLayoutSidebarLeftCollapse size={20} /> : <IconLayoutSidebarLeftExpand size={20} />}
        </IconButton>

        <IconBook size={18} color="#1976D2" style={{ flexShrink: 0 }} />
        <Typography variant="subtitle2" noWrap sx={{ flex: 1, fontWeight: 600 }}>{activeBook.title}</Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: 96, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.secondary">{progress}%</Typography>
        </Box>

        {/* Font size controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: 1, borderColor: 'divider', borderRadius: 1, px: 0.5 }}>
          <IconButton size="small" onClick={() => setFontSize(s => Math.max(12, s - 1))} title="Giảm cỡ chữ">
            <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>A-</Typography>
          </IconButton>
          <Typography variant="caption" sx={{ minWidth: 22, textAlign: 'center', fontWeight: 600 }}>{fontSize}</Typography>
          <IconButton size="small" onClick={() => setFontSize(s => Math.min(28, s + 1))} title="Tăng cỡ chữ">
            <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>A+</Typography>
          </IconButton>
        </Box>

        <Tooltip title={isBookmarked ? 'Bỏ bookmark' : 'Bookmark trang này (B)'}>
          <IconButton size="small" onClick={toggleBookmark} sx={{ color: isBookmarked ? 'warning.main' : 'text.secondary' }}>
            {isBookmarked ? <IconBookmarkFilled size={20} /> : <IconBookmark size={20} />}
          </IconButton>
        </Tooltip>

        {supportsFullscreen && (
          <Tooltip title={isFullscreen ? 'Thoát toàn màn hình (F)' : 'Toàn màn hình (F)'}>
            <IconButton size="small" onClick={toggleFullscreen} sx={{ color: isFullscreen ? 'primary.main' : 'text.secondary' }}>
              {isFullscreen ? <IconMinimize size={20} /> : <IconMaximize size={20} />}
            </IconButton>
          </Tooltip>
        )}

        <Button
          size="small"
          variant="contained"
          onClick={() => setActiveBook(null)}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Mở sách khác
        </Button>
      </Box>

      {/* Progress bar strip */}
      {!isFullscreen && <LinearProgress variant="determinate" value={progress} sx={{ height: 3, flexShrink: 0 }} />}

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        {sidebarOpen && !isFullscreen && (
          <Box sx={{ width: 256, flexShrink: 0, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <EbookSidebarPanel
              bookmarks={bookmarks}
              comments={comments}
              currentPage={currentPage}
              onGoToPage={goToPage}
              onDeleteBookmark={async (id) => {
                try {
                  await ebookRepository.deleteBookmark(id);
                  setBookmarks(prev => prev.filter(bk => bk.id !== id));
                } catch { setError('Không thể xóa bookmark.'); }
              }}
              onDeleteComment={deleteComment}
              onUpdateComment={updateComment}
            />
          </Box>
        )}

        {/* Main reading area */}
        <Box
          component="main"
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) < 50) return;
            if (dx < 0) goToPage(currentPage + 1); // swipe left → next
            else goToPage(currentPage - 1);         // swipe right → prev
          }}
          sx={{ flex: 1, overflow: 'auto', ...(isFullscreen && { height: '100vh' }) }}
        >
          <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 4 } }}>
            {readerLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Chip
                  icon={<CircularProgress size={14} />}
                  label="Đang tải dữ liệu..."
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}

            {error && (
              <Alert
                severity="warning"
                icon={<IconAlertCircle size={16} />}
                onClose={() => setError(null)}
                sx={{ mb: 3 }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Chip
                label={`Trang ${currentPage} / ${totalPages}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 600, letterSpacing: 0.5 }}
              />
            </Box>

            <Paper elevation={0} variant="outlined" sx={{ px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 }, minHeight: 500, borderRadius: 2 }}>
              <EbookPageContent
                pageNumber={currentPage}
                text={currentText}
                highlights={pageHighlights}
                comments={pageComments}
                onTextSelection={handleTextSelection}
                fontSize={fontSize}
              />
            </Paper>

            {/* Pagination */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, gap: 1 }}>
              <IconButton
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                size="small"
              >
                <IconChevronsLeft size={18} />
              </IconButton>

              <Button
                startIcon={<IconChevronLeft size={16} />}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Trước
              </Button>

              <Box
                component="form"
                onSubmit={e => {
                  e.preventDefault();
                  const p = parseInt(jumpPage);
                  if (!isNaN(p)) { goToPage(p); setJumpPage(''); }
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                <TextField
                  type="number"
                  size="small"
                  value={jumpPage}
                  onChange={e => setJumpPage(e.target.value)}
                  placeholder={String(currentPage)}
                  inputProps={{ min: 1, max: activeBook.totalPages, style: { textAlign: 'center', width: 56 } }}
                  sx={{ '& .MuiInputBase-root': { height: 32 } }}
                />
                <Typography variant="body2" color="text.secondary">/ {activeBook.totalPages}</Typography>
              </Box>

              <Button
                endIcon={<IconChevronRight size={16} />}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === activeBook.totalPages}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Sau
              </Button>

              <IconButton
                onClick={() => goToPage(activeBook.totalPages)}
                disabled={currentPage === activeBook.totalPages}
                size="small"
              >
                <IconChevronsRight size={18} />
              </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center', mt: 2 }}>
              ← → để chuyển trang · B để bookmark · F để toàn màn hình
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Exit fullscreen button — only shown in fullscreen */}
      {isFullscreen && (
        <Box
          onClick={toggleFullscreen}
          sx={{
            position: 'absolute', top: 12, right: 12, zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.3)', color: 'white', cursor: 'pointer',
            opacity: 0, transition: 'opacity 0.2s',
            '&:hover': { opacity: 1, bgcolor: 'rgba(0,0,0,0.6)' },
          }}
        >
          <IconMinimize size={18} />
        </Box>
      )}

      {/* Floating prev/next arrows */}
      <Box
        onClick={() => goToPage(currentPage - 1)}
        sx={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.3)',
          color: 'white',
          cursor: 'pointer',
          opacity: currentPage === 1 ? 0 : { xs: 1, md: 0 },
          transition: 'opacity 0.2s',
          '&:hover': { opacity: currentPage === 1 ? 0 : 1, bgcolor: 'rgba(0,0,0,0.55)' },
          pointerEvents: currentPage === 1 ? 'none' : 'auto',
        }}
      >
        <IconChevronLeft size={26} />
      </Box>

      <Box
        onClick={() => goToPage(currentPage + 1)}
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.3)',
          color: 'white',
          cursor: 'pointer',
          opacity: currentPage === totalPages ? 0 : { xs: 1, md: 0 },
          transition: 'opacity 0.2s',
          '&:hover': { opacity: currentPage === totalPages ? 0 : 1, bgcolor: 'rgba(0,0,0,0.55)' },
          pointerEvents: currentPage === totalPages ? 'none' : 'auto',
        }}
      >
        <IconChevronRight size={26} />
      </Box>

      {/* Selection toolbar (floats above everything) */}
      <SelectionToolbar
        selection={selection}
        onHighlight={addHighlight}
        onAddComment={addComment}
        onClose={() => { setSelection(null); window.getSelection()?.removeAllRanges(); }}
      />
    </Box>
  );
}

// ── Default export ────────────────────────────────────────────────────────────
export default function EbookPage() {
  return (
    <PageContainer title="Đọc Sách" description="Ebook reader với highlight và ghi chú">
      <EbookReader />
    </PageContainer>
  );
}
