'use client';

import { useState, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { BIBLE_BOOKS } from '@/app/lib/bibleData';
import { fetchBibleVerseText } from '@/app/lib/bibleVerseText';
import Tooltip from '@mui/material/Tooltip';

const SEP = '; ';

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitRefs(value) {
  return (value || '').split(SEP).map(s => s.trim()).filter(Boolean);
}

function parseRef(ref) {
  const cross = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (cross) return { book: cross[1], chFrom: +cross[2], vFrom: +cross[3], chTo: +cross[4], vTo: +cross[5] };
  const same = ref.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (same) return { book: same[1], chFrom: +same[2], vFrom: +same[3], chTo: +same[2], vTo: +same[4] };
  const single = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (single) return { book: single[1], chFrom: +single[2], vFrom: +single[3], chTo: +single[2], vTo: +single[3] };
  // Format từ lịch đọc: "Thi-thiên 36-38" (chapter range, không có verse)
  const chapRange = ref.match(/^(.+?)\s+(\d+)-(\d+)$/);
  if (chapRange) return { book: chapRange[1], chFrom: +chapRange[2], vFrom: 1, chTo: +chapRange[3], vTo: 1 };
  // Single chapter: "Thi-thiên 36"
  const chapOnly = ref.match(/^(.+?)\s+(\d+)$/);
  if (chapOnly) return { book: chapOnly[1], chFrom: +chapOnly[2], vFrom: 1, chTo: +chapOnly[2], vTo: 1 };
  return null;
}

function buildRef(book, chFrom, vFrom, chTo, vTo) {
  if (chFrom === chTo) return vFrom === vTo ? `${book} ${chFrom}:${vFrom}` : `${book} ${chFrom}:${vFrom}-${vTo}`;
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

  const title = status === 'loading' ? 'Đang tải...' : status === 'done' ? (text ?? 'Không tìm thấy') : '';

  return (
    <Tooltip title={title} arrow placement="top"
      slotProps={{ tooltip: { sx: { maxWidth: 340, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, bgcolor: 'rgba(20,40,20,0.95)' } } }}
    >
      <Chip label={label} size="small" color={color} variant={variant}
        onDelete={onDelete} onClick={onClick} onMouseEnter={handleMouseEnter} sx={sx} />
    </Tooltip>
  );
}

// ── Book dropdown with search (từ BibleRangePicker) ───────────────────────────

function BookSelect({ value, onChange, books, placeholder, disabled }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => books.filter(n => n.toLowerCase().includes(search.toLowerCase())),
    [books, search],
  );

  return (
    <Select
      size="small"
      displayEmpty
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onClose={() => setSearch('')}
      MenuProps={{ PaperProps: { sx: { maxHeight: 360 } }, autoFocus: false }}
      sx={{ minWidth: 160, fontSize: 13 }}
    >
      <ListSubheader sx={{ pt: 1, pb: 0.5, lineHeight: 1 }}>
        <TextField
          size="small"
          placeholder="Tìm sách..."
          fullWidth
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          sx={{ fontSize: 13 }}
        />
      </ListSubheader>
      {placeholder !== undefined && (
        <MenuItem value="" sx={{ fontSize: 13, color: 'text.disabled' }}><em>{placeholder}</em></MenuItem>
      )}
      {filtered.length === 0
        ? <MenuItem disabled sx={{ fontSize: 13, color: 'text.disabled' }}>Không tìm thấy</MenuItem>
        : filtered.map(name => <MenuItem key={name} value={name} sx={{ fontSize: 13 }}>{name}</MenuItem>)
      }
    </Select>
  );
}

// ── Chapter / Verse dropdown ──────────────────────────────────────────────────

function NumSelect({ value, onChange, items, label, disabled }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>{label}</Typography>
      <Select
        size="small"
        displayEmpty
        value={value ?? ''}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
        sx={{ width: 80, fontSize: 13 }}
      >
        <MenuItem value="" sx={{ fontSize: 13, color: 'text.disabled' }}><em>--</em></MenuItem>
        {items.map(n => <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n}</MenuItem>)}
      </Select>
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

  const [book, setBook]     = useState('');
  const [chFrom, setChFrom] = useState(1);
  const [vFrom, setVFrom]   = useState(1);
  const [chTo, setChTo]     = useState(1);
  const [vTo, setVTo]       = useState(1);

  const currentRefs = useMemo(() => splitRefs(value), [value]);

  const displayBooks = useMemo(() => {
    if (suggestedBooks?.length > 0)
      return suggestedBooks.map(sb => BIBLE_BOOKS.find(b => b.name === sb.name)).filter(Boolean);
    return BIBLE_BOOKS;
  }, [suggestedBooks]);

  const bookNames = useMemo(() => displayBooks.map(b => b.name), [displayBooks]);
  const bookData  = useMemo(() => BIBLE_BOOKS.find(b => b.name === book), [book]);
  const totalCh   = bookData?.chapters.length ?? 1;

  const sugEntry = useMemo(() => suggestedBooks?.find(sb => sb.name === book), [suggestedBooks, book]);
  const chapMin  = sugEntry?.chapFrom ?? 1;
  const chapMax  = sugEntry?.chapTo   ?? totalCh;

  const verseCountFrom = bookData ? (bookData.chapters[chFrom - 1] ?? 1) : 1;
  const verseCountTo   = bookData ? (bookData.chapters[chTo   - 1] ?? 1) : 1;

  const chFromItems = useMemo(() => Array.from({ length: chapMax - chapMin + 1 }, (_, i) => chapMin + i), [chapMin, chapMax]);
  const vFromItems  = useMemo(() => Array.from({ length: verseCountFrom }, (_, i) => i + 1), [verseCountFrom]);
  const chToItems   = useMemo(() => Array.from({ length: chapMax - chFrom + 1 }, (_, i) => chFrom + i), [chFrom, chapMax]);
  const vToItems    = useMemo(() => {
    const start = chTo === chFrom ? vFrom : 1;
    return Array.from({ length: verseCountTo - start + 1 }, (_, i) => start + i);
  }, [chTo, chFrom, vFrom, verseCountTo]);

  function handleOpen() {
    setModalRefs(splitRefs(value));
    const first = splitRefs(value)[0];
    const parsed = first ? parseRef(first) : null;
    if (parsed && displayBooks.find(b => b.name === parsed.book)) {
      setBook(parsed.book); setChFrom(parsed.chFrom); setVFrom(parsed.vFrom);
      setChTo(parsed.chTo); setVTo(parsed.vTo);
    } else {
      const defaultBook = displayBooks[0]?.name ?? '';
      const defEntry = suggestedBooks?.find(sb => sb.name === defaultBook);
      const min = defEntry?.chapFrom ?? 1;
      setBook(defaultBook); setChFrom(min); setVFrom(1); setChTo(min); setVTo(1);
    }
    setOpen(true);
  }

  function handleBookChange(b) {
    setBook(b);
    const entry = suggestedBooks?.find(sb => sb.name === b);
    const min = entry?.chapFrom ?? 1;
    setChFrom(min); setVFrom(1); setChTo(min); setVTo(1);
  }

  function handleChFromChange(ch) {
    setChFrom(ch); setVFrom(1);
    if (chTo < ch) { setChTo(ch); setVTo(1); }
  }

  function handleVFromChange(v) {
    setVFrom(v);
    if (chTo === chFrom && vTo < v) setVTo(v);
  }

  function handleChToChange(ch) { setChTo(ch); setVTo(1); }

  function handleAddRef() {
    if (!book) return;
    const ref = buildRef(book, chFrom, vFrom, chTo, vTo);
    if (!modalRefs.includes(ref)) setModalRefs(prev => [...prev, ref]);
  }

  function handleRemoveModal(idx)    { setModalRefs(prev => prev.filter((_, i) => i !== idx)); }
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

          {/* Book */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>Sách</Typography>
            <BookSelect value={book} onChange={handleBookChange} books={bookNames} placeholder="-- Chọn sách --" />
          </Box>

          {/* From / To */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>Từ</Typography>
            <NumSelect label="Đoạn" value={chFrom} onChange={handleChFromChange} items={chFromItems} disabled={!book} />
            <NumSelect label="Câu"  value={vFrom}  onChange={handleVFromChange}  items={vFromItems}  disabled={!book} />

            <Typography variant="body2" color="text.secondary" sx={{ pb: 1, px: 0.5 }}>—</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>Đến</Typography>
            <NumSelect label="Đoạn" value={chTo} onChange={handleChToChange} items={chToItems} disabled={!book} />
            <NumSelect label="Câu"  value={vTo}  onChange={setVTo}           items={vToItems}  disabled={!book} />
          </Box>

          {/* Preview + Add */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2.5 }}>
            {previewRef
              ? <Chip label={previewRef} color={canAdd ? 'primary' : 'default'} size="small" />
              : <Typography variant="caption" color="text.disabled">Chưa chọn</Typography>
            }
            <Button size="small" variant="contained" disabled={!canAdd} onClick={handleAddRef}>+ Thêm</Button>
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
