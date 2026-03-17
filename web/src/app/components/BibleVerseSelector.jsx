'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { BIBLE_BOOKS } from '@/app/lib/bibleData';
import { fetchBibleVerseText } from '@/app/lib/bibleVerseText';
import Tooltip from '@mui/material/Tooltip';

const SEP = '; ';
const ITEM_H = 44;
const VISIBLE = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitRefs(value) {
  return (value || '').split(SEP).map(s => s.trim()).filter(Boolean);
}

/**
 * Parse "Sáng Thế Ký 1:1-3:10" or "Sáng Thế Ký 3:16"
 * Returns { book, chFrom, vFrom, chTo, vTo }
 */
function parseRef(ref) {
  // Cross-chapter: "Book chFrom:vFrom-chTo:vTo"
  const cross = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (cross) {
    return {
      book: cross[1],
      chFrom: parseInt(cross[2]), vFrom: parseInt(cross[3]),
      chTo: parseInt(cross[4]),   vTo: parseInt(cross[5]),
    };
  }
  // Same chapter range: "Book ch:vFrom-vTo"
  const same = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (same) {
    return {
      book: same[1],
      chFrom: parseInt(same[2]), vFrom: parseInt(same[3]),
      chTo: parseInt(same[2]),   vTo: parseInt(same[4]),
    };
  }
  // Single verse: "Book ch:v"
  const single = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (single) {
    return {
      book: single[1],
      chFrom: parseInt(single[2]), vFrom: parseInt(single[3]),
      chTo: parseInt(single[2]),   vTo: parseInt(single[3]),
    };
  }
  return null;
}

function buildRef(book, chFrom, vFrom, chTo, vTo) {
  if (chFrom === chTo) {
    return vFrom === vTo
      ? `${book} ${chFrom}:${vFrom}`
      : `${book} ${chFrom}:${vFrom}-${vTo}`;
  }
  return `${book} ${chFrom}:${vFrom}-${chTo}:${vTo}`;
}

// ── Chip with hover-to-read tooltip ──────────────────────────────────────────

function VerseChipWithTooltip({ label, color = 'success', variant = 'outlined', sx, onDelete, onClick }) {
  const [text, setText] = useState(null);
  const [status, setStatus] = useState('idle');

  async function handleMouseEnter() {
    if (status !== 'idle') return;
    setStatus('loading');
    const t = await fetchBibleVerseText(label);
    setText(t);
    setStatus('done');
  }

  const title = status === 'loading' ? 'Đang tải...' : status === 'done' ? (text ?? 'Không tìm thấy nội dung') : '';

  return (
    <Tooltip title={title} arrow placement="top"
      slotProps={{ tooltip: { sx: { maxWidth: 340, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, bgcolor: 'rgba(20,40,20,0.95)' } } }}
    >
      <Chip label={label} size="small" color={color} variant={variant}
        onDelete={onDelete} onClick={onClick} onMouseEnter={handleMouseEnter} sx={sx} />
    </Tooltip>
  );
}

// ── Drum roll ─────────────────────────────────────────────────────────────────

function SlotPicker({ options, value, onChange }) {
  const containerRef = useRef(null);
  const settlingRef = useRef(false);
  const timerRef = useRef(null);
  const height = ITEM_H * VISIBLE;
  const pad = ITEM_H * Math.floor(VISIBLE / 2);

  const scrollToIndex = useCallback((idx, smooth = false) => {
    const el = containerRef.current;
    if (!el) return;
    settlingRef.current = true;
    el.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' });
    setTimeout(() => { settlingRef.current = false; }, 300);
  }, []);

  useEffect(() => {
    const idx = options.findIndex(o => o.value === value);
    if (idx >= 0) requestAnimationFrame(() => scrollToIndex(idx));
  }, [value, options, scrollToIndex]);

  function handleScroll() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el || settlingRef.current) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, options.length - 1));
      settlingRef.current = true;
      el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
      setTimeout(() => { settlingRef.current = false; }, 300);
      if (options[clamped] && options[clamped].value !== value) {
        onChange(options[clamped].value);
      }
    }, 80);
  }

  return (
    <Box sx={{ position: 'relative', height, flex: 1, minWidth: 0 }}>
      {/* Selection ring */}
      <Box sx={{ position: 'absolute', top: '50%', left: 2, right: 2, height: ITEM_H, transform: 'translateY(-50%)', bgcolor: 'primary.main', opacity: 0.08, borderRadius: 1.5, pointerEvents: 'none', zIndex: 1 }} />
      <Box sx={{ position: 'absolute', top: '50%', left: 2, right: 2, height: ITEM_H, transform: 'translateY(-50%)', border: '1.5px solid', borderColor: 'primary.main', opacity: 0.3, borderRadius: 1.5, pointerEvents: 'none', zIndex: 1 }} />
      {/* Fades */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '38%', background: 'linear-gradient(to bottom,rgba(255,255,255,.96),transparent)', pointerEvents: 'none', zIndex: 2 }} />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', background: 'linear-gradient(to top,rgba(255,255,255,.96),transparent)', pointerEvents: 'none', zIndex: 2 }} />
      {/* List */}
      <Box ref={containerRef} onScroll={handleScroll} sx={{ width: '100%', height: '100%', overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch', pt: `${pad}px`, pb: `${pad}px` }}>
        {options.map(opt => (
          <Box key={opt.value}
            onClick={() => { const idx = options.findIndex(o => o.value === opt.value); scrollToIndex(idx, true); onChange(opt.value); }}
            sx={{ height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'center', cursor: 'pointer', px: 0.5, userSelect: 'none' }}
          >
            <Typography noWrap sx={{ fontSize: opt.value === value ? 13.5 : 12.5, fontWeight: opt.value === value ? 700 : 400, color: opt.value === value ? 'primary.main' : 'text.secondary', transition: 'all 0.12s', textAlign: 'center', lineHeight: 1.2 }}>
              {opt.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Label above each drum roll ────────────────────────────────────────────────
function PickerCol({ label, options, value, onChange }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <SlotPicker options={options} value={value} onChange={onChange} />
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BibleVerseSelector({
  value,
  onChange,
  label = 'Kinh Thánh',
  size = 'small',
  fullWidth,
  placeholder = 'Click để chọn câu...',
  suggestedBooks,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [modalRefs, setModalRefs] = useState([]);

  // Picker state
  const [book, setBook]       = useState('');
  const [chFrom, setChFrom]   = useState(1);
  const [vFrom, setVFrom]     = useState(1);
  const [chTo, setChTo]       = useState(1);
  const [vTo, setVTo]         = useState(1);

  const currentRefs = useMemo(() => splitRefs(value), [value]);

  // Books available
  const displayBooks = useMemo(() => {
    if (suggestedBooks && suggestedBooks.length > 0) {
      return suggestedBooks
        .map(sb => BIBLE_BOOKS.find(b => b.name === sb.name))
        .filter(Boolean);
    }
    return BIBLE_BOOKS;
  }, [suggestedBooks]);

  const bookData    = useMemo(() => BIBLE_BOOKS.find(b => b.name === book), [book]);
  const totalCh     = bookData?.chapters.length ?? 1;
  const verseCountFrom = bookData ? (bookData.chapters[chFrom - 1] ?? 1) : 1;
  const verseCountTo   = bookData ? (bookData.chapters[chTo   - 1] ?? 1) : 1;

  // Chapter/verse limits from suggestedBooks
  const sugEntry  = useMemo(() => suggestedBooks?.find(sb => sb.name === book), [suggestedBooks, book]);
  const chapMin   = sugEntry?.chapFrom ?? 1;
  const chapMax   = sugEntry?.chapTo   ?? totalCh;

  // Options
  const bookOptions  = useMemo(() => displayBooks.map(b => ({ value: b.name, label: b.name })), [displayBooks]);
  const chFromOpts   = useMemo(() => Array.from({ length: chapMax - chapMin + 1 }, (_, i) => chapMin + i).map(ch => ({ value: ch, label: `Đoạn ${ch}` })), [chapMin, chapMax]);
  const vFromOpts    = useMemo(() => Array.from({ length: verseCountFrom }, (_, i) => i + 1).map(v => ({ value: v, label: `Câu ${v}` })), [verseCountFrom]);
  const chToOpts     = useMemo(() => Array.from({ length: chapMax - chFrom + 1 }, (_, i) => chFrom + i).map(ch => ({ value: ch, label: `Đoạn ${ch}` })), [chFrom, chapMax]);
  const vToOpts      = useMemo(() => {
    const start = chTo === chFrom ? vFrom : 1;
    return Array.from({ length: verseCountTo - start + 1 }, (_, i) => start + i).map(v => ({ value: v, label: `Câu ${v}` }));
  }, [chTo, chFrom, vFrom, verseCountTo]);

  function handleOpen() {
    setModalRefs(splitRefs(value));
    // Restore from first existing ref if possible
    const first = splitRefs(value)[0];
    const parsed = first ? parseRef(first) : null;
    if (parsed && displayBooks.find(b => b.name === parsed.book)) {
      setBook(parsed.book);
      setChFrom(parsed.chFrom); setVFrom(parsed.vFrom);
      setChTo(parsed.chTo);     setVTo(parsed.vTo);
    } else {
      const defaultBook = displayBooks[0]?.name ?? '';
      const defEntry = suggestedBooks?.find(sb => sb.name === defaultBook);
      setBook(defaultBook);
      setChFrom(defEntry?.chapFrom ?? 1); setVFrom(1);
      setChTo(defEntry?.chapFrom ?? 1);   setVTo(1);
    }
    setOpen(true);
  }

  function handleBookChange(b) {
    setBook(b);
    const entry = suggestedBooks?.find(sb => sb.name === b);
    const min = entry?.chapFrom ?? 1;
    setChFrom(min); setVFrom(1);
    setChTo(min);   setVTo(1);
  }

  function handleChFromChange(ch) {
    setChFrom(ch);
    setVFrom(1);
    if (chTo < ch) { setChTo(ch); setVTo(1); }
  }

  function handleVFromChange(v) {
    setVFrom(v);
    if (chTo === chFrom && vTo < v) setVTo(v);
  }

  function handleChToChange(ch) {
    setChTo(ch);
    setVTo(1);
  }

  function handleAddRef() {
    if (!book) return;
    const ref = buildRef(book, chFrom, vFrom, chTo, vTo);
    if (!modalRefs.includes(ref)) setModalRefs(prev => [...prev, ref]);
  }

  function handleRemoveModal(idx) { setModalRefs(prev => prev.filter((_, i) => i !== idx)); }
  function handleRemoveExternal(idx) { onChange(currentRefs.filter((_, i) => i !== idx).join(SEP)); }

  const previewRef = book ? buildRef(book, chFrom, vFrom, chTo, vTo) : '';
  const canAdd = !!previewRef && !modalRefs.includes(previewRef);

  return (
    <>
      {/* Trigger */}
      <Box onClick={handleOpen} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, minHeight: size === 'small' ? 40 : 56, px: 1.5, py: 0.75, border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1, cursor: 'pointer', position: 'relative', width: fullWidth ? '100%' : undefined, '&:hover': { borderColor: 'text.primary' } }}>
        <Typography component="label" sx={{ position: 'absolute', top: -9, left: 8, px: 0.5, bgcolor: 'background.paper', fontSize: 12, color: 'text.secondary', lineHeight: 1, pointerEvents: 'none' }}>
          {label}
        </Typography>
        {currentRefs.length === 0
          ? <Typography variant="body2" color="text.disabled" sx={{ userSelect: 'none' }}>{placeholder}</Typography>
          : currentRefs.map((ref, i) => (
            <VerseChipWithTooltip key={i} label={ref} color="success" variant="outlined"
              onDelete={e => { e.stopPropagation(); handleRemoveExternal(i); }}
              onClick={e => e.stopPropagation()} sx={{ fontSize: 12 }} />
          ))
        }
        <InputAdornment position="end" sx={{ ml: 'auto', pointerEvents: 'none' }}>
          <MenuBookIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </InputAdornment>
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ pb: 1 }}>Chọn Câu Kinh Thánh</DialogTitle>

        <DialogContent sx={{ pt: '12px !important' }}>

          {/* Book picker */}
          <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 1, mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5, fontWeight: 600 }}>Sách</Typography>
            <SlotPicker options={bookOptions} value={book} onChange={handleBookChange} />
          </Box>

          {/* From / To pickers */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>

            {/* FROM */}
            <Box sx={{ flex: 1, bgcolor: '#f5f5f5', borderRadius: 2, p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5, fontWeight: 600 }}>Từ</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <PickerCol label="Đoạn" options={chFromOpts} value={chFrom} onChange={handleChFromChange} />
                <PickerCol label="Câu"  options={vFromOpts}  value={vFrom}  onChange={handleVFromChange} />
              </Box>
            </Box>

            {/* Arrow */}
            <Box sx={{ display: 'flex', alignItems: 'center', height: ITEM_H * VISIBLE + 28, pt: '28px' }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: 20, px: 0.5 }}>→</Typography>
            </Box>

            {/* TO */}
            <Box sx={{ flex: 1, bgcolor: '#f5f5f5', borderRadius: 2, p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5, fontWeight: 600 }}>Đến</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <PickerCol label="Đoạn" options={chToOpts} value={chTo} onChange={handleChToChange} />
                <PickerCol label="Câu"  options={vToOpts}  value={vTo}  onChange={setVTo} />
              </Box>
            </Box>
          </Box>

          {/* Preview + Add */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
            {previewRef
              ? <Chip label={previewRef} color={canAdd ? 'primary' : 'default'} size="small" />
              : <Typography variant="caption" color="text.disabled">Chưa chọn</Typography>
            }
            <Button size="small" variant="contained" disabled={!canAdd} onClick={handleAddRef}>
              + Thêm
            </Button>
          </Box>

          {/* Selected list */}
          {modalRefs.length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Đã chọn ({modalRefs.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {modalRefs.map((ref, i) => (
                  <VerseChipWithTooltip key={i} label={ref} color="success" variant="filled"
                    onDelete={() => handleRemoveModal(i)} />
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => { setModalRefs([]); onChange(''); setOpen(false); }} color="error" variant="outlined" size="small">
            Xóa tất cả
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpen(false)} color="inherit" size="small">Hủy</Button>
            <Button onClick={() => { onChange(modalRefs.join(SEP)); setOpen(false); }} variant="contained" color="success" size="small">
              Hoàn tất
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
