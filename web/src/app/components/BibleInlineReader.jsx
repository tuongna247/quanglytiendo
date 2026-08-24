'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import {
  IconBook,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';

import { parsePassage } from '@/app/lib/bibleUtils';

// ── Shared constants ─────────────────────────────────────────────────────────
export const FONTS = [
  { label: 'Mặc định', value: 'inherit' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
  { label: 'Palatino', value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
];

export const HIGHLIGHT_COLORS = [
  { label: 'Xóa', value: null },
  { label: 'Vàng', value: '#FFF176' },
  { label: 'Xanh lá', value: '#A5D6A7' },
  { label: 'Xanh dương', value: '#90CAF9' },
  { label: 'Hồng', value: '#F48FB1' },
  { label: 'Cam', value: '#FFCC80' },
  { label: 'Tím', value: '#CE93D8' },
  { label: 'Ngọc', value: '#80DEEA' },
  { label: 'Đỏ nhạt', value: '#EF9A9A' },
  { label: 'Xám', value: '#CFD8DC' },
];

// ── Bible JSON cache — one fetch per session ─────────────────────────────────
let bibleCache = null;
let biblePromise = null;
export async function loadBible() {
  if (bibleCache) return bibleCache;
  if (biblePromise) return biblePromise;
  biblePromise = fetch('/bible.json')
    .then(res => res.json())
    .then(data => {
      const map = {};
      data.forEach(book => { map[book.id] = book.chapters; });
      bibleCache = map;
      return bibleCache;
    })
    .finally(() => { biblePromise = null; });
  return biblePromise;
}

// ── Bible text renderer (shared by inline + spotlight) ───────────────────────
export function BibleTextContent({ chapters, paragraphMode, highlights, activeColor, onHighlight, fontFamily, fontSize }) {
  return (
    <Box>
      {chapters.map(({ num, verses }) => (
        <Box key={num} sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontFamily, fontSize: fontSize * 0.85 }}>
            Chương {num}
          </Typography>
          {paragraphMode ? (
            <Typography sx={{ lineHeight: 2.1, fontFamily, fontSize }}>
              {verses.map((verse, idx) => {
                const key = `${num}_${idx}`;
                const bg = highlights[key];
                return (
                  <span
                    key={idx}
                    onClick={() => onHighlight(key)}
                    style={{
                      backgroundColor: bg || 'transparent',
                      borderRadius: 3,
                      padding: bg ? '1px 3px' : 0,
                      cursor: 'pointer',
                    }}
                  >
                    <sup style={{ fontWeight: 700, color: '#1976d2', fontSize: fontSize * 0.55, marginRight: 2 }}>{idx + 1}</sup>
                    {verse}{' '}
                  </span>
                );
              })}
            </Typography>
          ) : (
            verses.map((verse, idx) => {
              const key = `${num}_${idx}`;
              const bg = highlights[key];
              return (
                <Box
                  key={idx}
                  onClick={() => onHighlight(key)}
                  sx={{
                    display: 'flex', gap: 1.5, mb: 0.3, px: 0.5, py: 0.2, borderRadius: 1,
                    bgcolor: bg || 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: bg || 'action.hover' },
                  }}
                >
                  <Typography sx={{ minWidth: 22, fontWeight: 700, color: 'primary.main', mt: 0.3, lineHeight: 1.9, fontFamily, fontSize: fontSize * 0.75 }}>
                    {idx + 1}
                  </Typography>
                  <Typography sx={{ lineHeight: 1.9, flex: 1, fontFamily, fontSize }}>
                    {verse}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>
      ))}
    </Box>
  );
}

// ── Reading toolbar ──────────────────────────────────────────────────────────
export function BibleToolbar({
  paragraphMode, onToggleMode,
  fontFamily, onFontChange,
  fontSize, onFontSizeChange,
  activeColor, onColorChange,
  onToggleSpotlight, spotlightOpen,
}) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1.5 }}>
      <Chip
        label={paragraphMode ? 'Đoạn văn' : 'Từng câu'}
        size="small"
        variant="outlined"
        color="primary"
        onClick={onToggleMode}
        sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
      />

      <Divider orientation="vertical" flexItem />

      {FONTS.map(f => (
        <Chip
          key={f.value}
          label={f.label}
          size="small"
          variant={fontFamily === f.value ? 'filled' : 'outlined'}
          color={fontFamily === f.value ? 'primary' : 'default'}
          onClick={() => onFontChange(f.value)}
          sx={{ cursor: 'pointer', fontSize: '0.7rem', fontFamily: f.value !== 'inherit' ? f.value : undefined }}
        />
      ))}

      <Divider orientation="vertical" flexItem />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Giảm cỡ chữ" arrow>
          <IconButton size="small" onClick={() => onFontSizeChange(fontSize - 1)} disabled={fontSize <= 12}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>A−</Typography>
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{fontSize}px</Typography>
        <Tooltip title="Tăng cỡ chữ" arrow>
          <IconButton size="small" onClick={() => onFontSizeChange(fontSize + 1)} disabled={fontSize >= 28}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>A+</Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {HIGHLIGHT_COLORS.map((c, i) => (
          <Tooltip key={i} title={c.label} arrow>
            <Box
              onClick={() => onColorChange(c.value)}
              sx={{
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: c.value || 'transparent',
                border: c.value === activeColor
                  ? '2.5px solid #333'
                  : c.value === null ? '1.5px dashed #aaa' : '1.5px solid #bbb',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#666',
                flexShrink: 0,
              }}
            >
              {c.value === null && '×'}
            </Box>
          </Tooltip>
        ))}
      </Box>

      <Tooltip title={spotlightOpen ? 'Thoát spotlight' : 'Spotlight — chỉ đọc'} arrow>
        <IconButton size="small" onClick={onToggleSpotlight} sx={{ ml: 'auto' }}>
          {spotlightOpen ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ── Inline Bible Text Card ───────────────────────────────────────────────────
export function InlineBibleText({
  passage,
  dateStr,
  completed,
  toggle,
  compact = false,
  initialFontSize = 16,
}) {
  const [expanded, setExpanded] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [bibleData, setBibleData] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [paragraphMode, setParagraphMode] = useState(false);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [fontSize, setFontSize] = useState(initialFontSize);
  const hlKey = `qlTD_hl_${passage}`;
  const [highlights, setHighlights] = useState({});
  const [activeColor, setActiveColor] = useState('#FFF176');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(hlKey);
      setHighlights(raw ? JSON.parse(raw) : {});
    } catch { setHighlights({}); }
  }, [hlKey]);

  const parsed = parsePassage(passage);

  function ensureLoaded() {
    if (!bibleData) {
      setLoadingBible(true);
      loadBible().then(data => { setBibleData(data); setLoadingBible(false); });
    }
  }

  function handleExpand() {
    if (!expanded) ensureLoaded();
    setExpanded(e => !e);
  }

  function handleSpotlight() {
    ensureLoaded();
    setSpotlight(true);
  }

  function applyHighlight(key) {
    setHighlights(prev => {
      const next = { ...prev };
      if (activeColor === null || prev[key] === activeColor) {
        delete next[key];
      } else {
        next[key] = activeColor;
      }
      try { localStorage.setItem(hlKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  if (!parsed) return null;

  const isDone = dateStr && completed ? !!completed[dateStr] : false;

  const chapters = [];
  if (bibleData && bibleData[parsed.bookId]) {
    const totalCh = bibleData[parsed.bookId].length;
    const chTo = Math.min(parsed.chTo, totalCh);
    for (let ch = parsed.chFrom; ch <= chTo; ch++) {
      chapters.push({ num: ch, verses: (bibleData[parsed.bookId][ch - 1] || []).filter(v => typeof v === 'string') });
    }
  }

  const toolbarProps = {
    paragraphMode, onToggleMode: () => setParagraphMode(m => !m),
    fontFamily, onFontChange: setFontFamily,
    fontSize, onFontSizeChange: v => setFontSize(Math.min(28, Math.max(12, v))),
    activeColor, onColorChange: setActiveColor,
  };

  const textContent = loadingBible
    ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
    : <BibleTextContent
        chapters={chapters}
        paragraphMode={paragraphMode}
        highlights={highlights}
        activeColor={activeColor}
        onHighlight={applyHighlight}
        fontFamily={fontFamily}
        fontSize={fontSize}
      />;

  const canToggle = dateStr && toggle;

  return (
    <>
      <Dialog fullScreen open={spotlight} onClose={() => setSpotlight(false)}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, sm: 5 }, overflowY: 'auto' }}>
          <Box sx={{ maxWidth: 740, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconBook size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontFamily }}>{passage}</Typography>
              {canToggle && (
                <Chip
                  label={isDone ? '✓ Đã đọc' : 'Chưa đọc'}
                  size="small"
                  color={isDone ? 'success' : 'default'}
                  onClick={() => toggle(dateStr)}
                  sx={{ cursor: 'pointer' }}
                />
              )}
            </Box>
            <BibleToolbar {...toolbarProps} spotlightOpen onToggleSpotlight={() => setSpotlight(false)} />
            <Divider sx={{ mb: 2 }} />
            {textContent}
          </Box>
        </Box>
      </Dialog>

      <Card sx={{ borderRadius: 2, mb: compact ? 0 : 2, border: isDone ? '1px solid' : 'none', borderColor: 'success.light' }}>
        <CardContent sx={{ pb: '12px !important', p: compact ? 1.5 : 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <IconBook size={compact ? 16 : 18} />
            <Typography variant={compact ? 'body2' : 'subtitle1'} sx={{ fontWeight: 700, flex: 1 }}>{passage}</Typography>
            {canToggle && (
              <Chip
                label={isDone ? '✓ Đã đọc' : 'Chưa đọc'}
                size="small"
                color={isDone ? 'success' : 'default'}
                onClick={() => toggle(dateStr)}
                sx={{ cursor: 'pointer' }}
              />
            )}
            <Tooltip title="Spotlight — chỉ đọc" arrow>
              <IconButton size="small" onClick={handleSpotlight}><IconArrowsMaximize size={16} /></IconButton>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              endIcon={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              onClick={handleExpand}
            >
              {expanded ? 'Thu gọn' : 'Đọc ngay'}
            </Button>
          </Box>
          <Collapse in={expanded}>
            <Divider sx={{ mt: 1.5, mb: 1 }} />
            <BibleToolbar {...toolbarProps} spotlightOpen={false} onToggleSpotlight={handleSpotlight} />
            <Box sx={{ maxHeight: 480, overflowY: 'auto', pr: 1 }}>
              {textContent}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </>
  );
}
