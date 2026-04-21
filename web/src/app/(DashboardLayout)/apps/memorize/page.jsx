'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { IconPlus, IconTrash, IconChevronLeft, IconEye, IconBulb, IconBrain } from '@tabler/icons-react';

import PageContainer from '@/app/components/container/PageContainer';
import { BOOK_NAME_TO_ID } from '@/app/lib/bibleUtils';
import apiClient from '@/app/lib/apiClient';

// ─── Bible cache ───────────────────────────────────────────────────────────────
let bibleCache = null;
async function loadBible() {
  if (bibleCache) return bibleCache;
  const res = await fetch('/bible.json');
  const data = await res.json();
  const map = {};
  data.forEach(book => { map[book.id] = book.chapters; });
  bibleCache = map;
  return bibleCache;
}

// ─── Parser: "Giăng 3:16", "Rô-ma 8", "Phi-líp 4:4-7", "Rô-ma 8-9" ──────────
function parseVerseRef(str) {
  str = str.trim();
  let bookId = null, bookName = null, remainder = '';

  // Sort by name length desc to avoid partial matches
  const entries = Object.entries(BOOK_NAME_TO_ID).sort((a, b) => b[0].length - a[0].length);
  for (const [name, id] of entries) {
    if (str.toLowerCase().startsWith(name.toLowerCase())) {
      bookId = id;
      bookName = name;
      remainder = str.slice(name.length).trim();
      break;
    }
  }
  if (!bookId) return null;

  // "chapter:v1-v2"
  let m = remainder.match(/^(\d+):(\d+)-(\d+)$/);
  if (m) return { bookId, bookName, chapter: +m[1], chapterTo: +m[1], verseFrom: +m[2], verseTo: +m[3] };

  // "chapter:v1"
  m = remainder.match(/^(\d+):(\d+)$/);
  if (m) return { bookId, bookName, chapter: +m[1], chapterTo: +m[1], verseFrom: +m[2], verseTo: +m[2] };

  // "chapter1-chapter2"
  m = remainder.match(/^(\d+)-(\d+)$/);
  if (m) return { bookId, bookName, chapter: +m[1], chapterTo: +m[2], verseFrom: null, verseTo: null };

  // "chapter"
  m = remainder.match(/^(\d+)$/);
  if (m) return { bookId, bookName, chapter: +m[1], chapterTo: +m[1], verseFrom: null, verseTo: null };

  return null;
}

function getVersesFromBible(bibleData, parsed) {
  if (!bibleData || !bibleData[parsed.bookId]) return [];
  const verses = [];
  for (let ch = parsed.chapter; ch <= parsed.chapterTo; ch++) {
    const chVerses = (bibleData[parsed.bookId][ch - 1] || []).filter(v => typeof v === 'string');
    const vFrom = (ch === parsed.chapter && parsed.verseFrom) ? parsed.verseFrom : 1;
    const vTo = (ch === parsed.chapterTo && parsed.verseTo) ? parsed.verseTo : chVerses.length;
    for (let v = vFrom; v <= vTo; v++) {
      if (chVerses[v - 1] !== undefined) {
        verses.push({ ref: `${parsed.bookName} ${ch}:${v}`, chapter: ch, verse: v, text: chVerses[v - 1] });
      }
    }
  }
  return verses;
}

// ─── Hint: chỉ hiện chữ cái đầu mỗi từ ────────────────────────────────────────
function makeHint(text) {
  return text.split(' ').map(word => {
    const m = word.match(/^([\p{L}\d]+)([\p{P}\s]*)$/u);
    if (!m || m[1].length <= 1) return word;
    return m[1][0] + '—'.repeat(m[1].length - 1) + m[2];
  }).join(' ');
}

// ─── Map API item to local passage shape ────────────────────────────────────────
function mapApiToPassage(item) {
  return {
    id: item.id,
    reference: item.reference,
    parsed: JSON.parse(item.parsedJson),
    mastered: JSON.parse(item.masteredJson),
    addedAt: item.addedAt ? item.addedAt.split('T')[0] : '',
  };
}

// ─── VerseCard ─────────────────────────────────────────────────────────────────
function VerseCard({ verseData, mode, mastered, onToggleMastered }) {
  const [revealed, setRevealed] = useState([]);
  useEffect(() => { setRevealed([]); }, [mode, verseData.ref]);

  const words = verseData.text.split(' ');

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        borderColor: mastered ? 'success.main' : 'divider',
        borderWidth: mastered ? 2 : 1,
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {verseData.ref}
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={mastered} onChange={onToggleMastered} size="small" color="success" />}
            label={<Typography variant="caption" color={mastered ? 'success.main' : 'text.secondary'}>{mastered ? '✓ Đã thuộc' : 'Đã thuộc'}</Typography>}
            sx={{ m: 0 }}
          />
        </Box>

        {/* Xem mode */}
        {mode === 'read' && (
          <Typography variant="body2" sx={{ lineHeight: 1.9 }}>{verseData.text}</Typography>
        )}

        {/* Gợi ý mode */}
        {mode === 'hint' && (
          <Typography variant="body2" sx={{ lineHeight: 1.9, letterSpacing: 0.3, color: 'text.primary' }}>
            {makeHint(verseData.text)}
          </Typography>
        )}

        {/* Ôn lại mode: click từng từ để hiện */}
        {mode === 'recall' && (
          <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {words.map((word, idx) => {
                const isRevealed = revealed.includes(idx);
                return (
                  <Box
                    key={idx}
                    onClick={() => !isRevealed && setRevealed(prev => [...prev, idx])}
                    sx={{
                      px: 0.75, py: 0.2, borderRadius: 0.5, cursor: isRevealed ? 'default' : 'pointer',
                      bgcolor: isRevealed ? 'transparent' : 'primary.main',
                      color: isRevealed ? 'text.primary' : 'primary.main',
                      border: '1px solid',
                      borderColor: isRevealed ? 'divider' : 'primary.main',
                      minWidth: `${Math.max(word.replace(/[^\p{L}\d]/gu, '').length * 9, 20)}px`,
                      fontSize: '0.8rem', lineHeight: 1.7,
                      userSelect: 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isRevealed ? word : ''}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {revealed.length < words.length && (
                <Button size="small" variant="text" onClick={() => setRevealed(words.map((_, i) => i))}>
                  Hiện tất cả
                </Button>
              )}
              {revealed.length > 0 && (
                <Button size="small" variant="text" color="inherit" onClick={() => setRevealed([])}>
                  Ẩn lại
                </Button>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── StudyView ─────────────────────────────────────────────────────────────────
function StudyView({ passage, bibleData, onBack, onUpdate }) {
  const [mode, setMode] = useState('read');
  const [mastered, setMastered] = useState(passage.mastered || []);

  const verses = getVersesFromBible(bibleData, passage.parsed);
  const masteredCount = mastered.filter(Boolean).length;
  const progress = verses.length ? Math.round(masteredCount / verses.length * 100) : 0;

  function toggleMastered(idx) {
    const next = [...mastered];
    next[idx] = !next[idx];
    setMastered(next);
    onUpdate({ ...passage, mastered: next });
  }

  function markAll(val) {
    const next = new Array(verses.length).fill(val);
    setMastered(next);
    onUpdate({ ...passage, mastered: next });
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <IconButton onClick={onBack} size="small"><IconChevronLeft size={20} /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>{passage.reference}</Typography>
        <Chip
          label={`${masteredCount}/${verses.length} câu thuộc lòng`}
          color={progress === 100 ? 'success' : 'default'}
          size="small"
        />
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate" value={progress}
          color={progress === 100 ? 'success' : 'primary'}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Mode toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
        <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} size="small">
          <ToggleButton value="read" sx={{ gap: 0.5 }}>
            <IconEye size={15} /> Xem
          </ToggleButton>
          <ToggleButton value="hint" sx={{ gap: 0.5 }}>
            <IconBulb size={15} /> Gợi ý
          </ToggleButton>
          <ToggleButton value="recall" sx={{ gap: 0.5 }}>
            <IconBrain size={15} /> Ôn lại
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
        {mode === 'read' && 'Đọc và ghi nhớ từng câu. Đánh dấu ✓ khi bạn đã thuộc.'}
        {mode === 'hint' && 'Chỉ hiện chữ đầu mỗi từ — thử đọc lại cả câu từ gợi ý.'}
        {mode === 'recall' && 'Tất cả từ bị ẩn — click vào ô để hiện từng từ.'}
      </Typography>

      {/* Quick actions */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => markAll(true)}>Đánh dấu tất cả đã thuộc</Button>
        <Button size="small" variant="outlined" color="inherit" onClick={() => markAll(false)}>Reset tất cả</Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Verse cards */}
      {verses.map((v, idx) => (
        <VerseCard
          key={`${v.ref}-${idx}`}
          verseData={v}
          mode={mode}
          mastered={!!mastered[idx]}
          onToggleMastered={() => toggleMastered(idx)}
        />
      ))}

      {progress === 100 && (
        <Card sx={{ bgcolor: 'success.light', borderRadius: 2, mt: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: '16px !important' }}>
            <Typography variant="h6" sx={{ color: 'success.dark' }}>
              🎉 Bạn đã thuộc hết phân đoạn này!
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.dark', mt: 0.5 }}>
              Hãy tiếp tục ôn luyện để không quên nhé.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MemorizePage() {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [bibleData, setBibleData] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [previewVerses, setPreviewVerses] = useState([]);
  const [parseError, setParseError] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch passages from API on mount
  useEffect(() => {
    fetchPassages();
  }, []);

  async function fetchPassages() {
    setLoading(true);
    try {
      const items = await apiClient.get('/api/memorize');
      if (items) {
        setPassages(items.map(mapApiToPassage));
      }
    } catch (err) {
      console.error('Failed to load passages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function ensureBible() {
    if (bibleData) return bibleData;
    setLoadingBible(true);
    const data = await loadBible();
    setBibleData(data);
    setLoadingBible(false);
    return data;
  }

  async function handleRefChange(val) {
    setRefInput(val);
    setParseError('');
    setPreviewVerses([]);
    if (!val.trim()) return;

    const parsed = parseVerseRef(val);
    if (!parsed) {
      setParseError('Không nhận diện được. VD: "Giăng 3:16", "Rô-ma 8", "Phi-líp 4:4-7"');
      return;
    }

    const bible = await ensureBible();
    const verses = getVersesFromBible(bible, parsed);
    if (verses.length === 0) {
      setParseError('Không tìm thấy câu kinh thánh nào.');
      return;
    }
    if (verses.length > 100) {
      setParseError(`Quá nhiều câu (${verses.length}). Hãy chọn phân đoạn ngắn hơn.`);
      return;
    }
    setPreviewVerses(verses);
  }

  async function handleAdd() {
    if (!previewVerses.length) return;
    const parsed = parseVerseRef(refInput);
    setAdding(true);
    try {
      const created = await apiClient.post('/api/memorize', {
        reference: refInput.trim(),
        parsedJson: JSON.stringify(parsed),
        masteredJson: JSON.stringify(new Array(previewVerses.length).fill(false)),
      });
      if (created) {
        setPassages(prev => [mapApiToPassage(created), ...prev]);
      }
      closeDialog();
    } catch (err) {
      console.error('Failed to add passage:', err);
    } finally {
      setAdding(false);
    }
  }

  function closeDialog() {
    setDialogOpen(false);
    setRefInput('');
    setPreviewVerses([]);
    setParseError('');
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Xóa phân đoạn này?')) return;
    try {
      await apiClient.delete(`/api/memorize/${id}`);
      setPassages(prev => prev.filter(p => p.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('Failed to delete passage:', err);
    }
  }

  async function handleUpdate(updatedPassage) {
    // Optimistic update
    setPassages(prev => prev.map(p => p.id === updatedPassage.id ? updatedPassage : p));
    try {
      await apiClient.put(`/api/memorize/${updatedPassage.id}`, {
        masteredJson: JSON.stringify(updatedPassage.mastered),
      });
    } catch (err) {
      console.error('Failed to update mastered:', err);
      // Revert on failure
      fetchPassages();
    }
  }

  async function openStudy(passage) {
    await ensureBible();
    setSelectedId(passage.id);
  }

  const selectedPassage = passages.find(p => p.id === selectedId);

  return (
    <PageContainer title="Học Thuộc Lòng" description="Học thuộc lòng Kinh Thánh">

      {/* Study View */}
      {selectedPassage && bibleData ? (
        <StudyView
          passage={selectedPassage}
          bibleData={bibleData}
          onBack={() => setSelectedId(null)}
          onUpdate={handleUpdate}
        />
      ) : (
        <>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Học Thuộc Lòng Kinh Thánh</Typography>
              <Typography variant="body2" color="textSecondary">
                {passages.length} phân đoạn · {passages.reduce((s, p) => s + (p.mastered || []).filter(Boolean).length, 0)} câu đã thuộc
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setDialogOpen(true)}>
              Thêm phân đoạn
            </Button>
          </Box>

          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : passages.length === 0 ? (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Chưa có phân đoạn nào</Typography>
                <Typography color="textSecondary" variant="body2" sx={{ mb: 3 }}>
                  Thêm một đoạn kinh thánh để bắt đầu luyện tập
                </Typography>
                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={() => setDialogOpen(true)}>
                  Thêm phân đoạn đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {passages.map(passage => {
                const total = (passage.mastered || []).length;
                const done = (passage.mastered || []).filter(Boolean).length;
                const pct = total ? Math.round(done / total * 100) : 0;
                return (
                  <Card
                    key={passage.id}
                    sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}
                    onClick={() => openStudy(passage)}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: '12px !important' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{passage.reference}</Typography>
                          {pct === 100 && <Chip label="✓ Thuộc lòng" size="small" color="success" />}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {total} câu · Thêm ngày {passage.addedAt}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate" value={pct}
                            color={pct === 100 ? 'success' : 'primary'}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="textSecondary">{done}/{total} câu đã thuộc</Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" color="error" onClick={e => handleDelete(passage.id, e)}>
                        <IconTrash size={16} />
                      </IconButton>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm phân đoạn học thuộc lòng</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nhập phân đoạn kinh thánh"
              placeholder='VD: "Giăng 3:16"  "Rô-ma 8"  "Phi-líp 4:4-7"'
              value={refInput}
              onChange={e => handleRefChange(e.target.value)}
              error={!!parseError}
              helperText={parseError || ' '}
              autoFocus
              sx={{ mb: 1 }}
            />

            {loadingBible && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="caption">Đang tải Kinh Thánh...</Typography>
              </Box>
            )}

            {previewVerses.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Xem trước — {previewVerses.length} câu:
                </Typography>
                <Box sx={{ maxHeight: 280, overflowY: 'auto', bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
                  {previewVerses.map((v, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
                        {v.ref}
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.75 }}>{v.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={adding}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={previewVerses.length === 0 || adding}
            startIcon={adding ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Thêm {previewVerses.length > 0 ? `(${previewVerses.length} câu)` : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
