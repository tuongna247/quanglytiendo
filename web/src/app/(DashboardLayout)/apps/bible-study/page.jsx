'use client';
import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import {
  IconHistory,
  IconArrowLeft,
  IconPlus,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconTextIncrease,
  IconTextDecrease,
  IconBook,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import apiClient from '@/app/lib/apiClient';
import { BOOK_ID_TO_NAME } from '@/app/lib/bibleUtils';
import { useAuth } from '@/app/context/AuthContext';

// ── Bible data ────────────────────────────────────────────────────────────────
const BOOK_ORDER = [
  'gn','ex','lv','nm','dt','js','jud','rt','1sm','2sm','1kgs','2kgs',
  '1ch','2ch','ezr','ne','et','job','ps','prv','ec','so',
  'is','jr','lm','ez','dn','ho','jl','am','ob','jn','mi','na','hk','zp','hg','zc','ml',
  'mt','mk','lk','jo','act','rm','1co','2co','gl','eph','ph','cl',
  '1ts','2ts','1tm','2tm','tt','phm','hb','jm','1pe','2pe','1jo','2jo','3jo','jd','re',
];

const CHAPTER_COUNTS = {
  gn:50,ex:40,lv:27,nm:36,dt:34,js:24,jud:21,rt:4,
  '1sm':31,'2sm':24,'1kgs':22,'2kgs':25,'1ch':29,'2ch':36,
  ezr:10,ne:13,et:10,job:42,ps:150,prv:31,ec:12,so:8,
  is:66,jr:52,lm:5,ez:48,dn:12,ho:14,jl:3,am:9,ob:1,
  jn:4,mi:7,na:3,hk:3,zp:3,hg:2,zc:14,ml:4,
  mt:28,mk:16,lk:24,jo:21,act:28,rm:16,'1co':16,'2co':13,
  gl:6,eph:6,ph:4,cl:4,'1ts':5,'2ts':3,'1tm':6,'2tm':4,
  tt:3,phm:1,hb:13,jm:5,'1pe':5,'2pe':3,'1jo':5,'2jo':1,'3jo':1,jd:1,re:22,
};

const FONTS = [
  { label: 'Mặc định', value: 'inherit' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
  { label: 'Palatino', value: '"Palatino Linotype", serif' },
];

let bibleCache = null;
async function loadBible() {
  if (bibleCache) return bibleCache;
  const res = await fetch('/bible.json');
  const data = await res.json();
  const map = {};
  data.forEach(book => { map[book.id] = book.chapters; });
  bibleCache = map;
  return map;
}

// ── OIA defaults ──────────────────────────────────────────────────────────────
const defaultObs = () => ({ characters: '', actions: '', whereWhen: '', repeatedWords: '', connectingWords: '', commands: '', contrasts: '' });
const defaultInt = () => ({ mainIdea: '', whyImportant: '', aboutGod: '', aboutHuman: '', context: '' });
const defaultApp = () => ({ specificAction: '', when: '', obstacles: '', changeToday: '' });

const safeJson = (str, fallback) => { try { return JSON.parse(str) || fallback; } catch { return fallback; } };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function passageLabel(session) {
  const book = BOOK_ID_TO_NAME[session.bookId] || session.bookId;
  return `${book} ${session.chapter}:${session.verseFrom}–${session.verseTo}`;
}

// ── OIA field component (single-row textarea) ─────────────────────────────────
function OField({ label, value, onChange }) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={1}
      maxRows={4}
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      size="small"
      sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start' } }}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BibleStudyPage() {
  const { user } = useAuth();
  const [view, setView] = useState('study');

  // passage selection
  const [book, setBook] = useState('ph');
  const [chapter, setChapter] = useState(1);
  const [verseFrom, setVerseFrom] = useState(1);
  const [verseTo, setVerseTo] = useState(5);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [bibleOpen, setBibleOpen] = useState(true); // accordion

  // bible text
  const [bibleData, setBibleData] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);

  // OIA form
  const [sessionId, setSessionId] = useState(null);
  const [obs, setObs] = useState(defaultObs());
  const [int_, setInt] = useState(defaultInt());
  const [app, setApp] = useState(defaultApp());
  const [isCompleted, setIsCompleted] = useState(false);

  // history
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ui state
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoadingBible(true);
    loadBible().then(d => { setBibleData(d); setLoadingBible(false); });
  }, []);

  useEffect(() => {
    if (view !== 'history') return;
    setLoadingHistory(true);
    apiClient.get('/api/bible-study-sessions/history')
      .then(data => setHistory(data))
      .catch(() => setToast({ type: 'error', msg: 'Không tải được lịch sử' }))
      .finally(() => setLoadingHistory(false));
  }, [view]);

  const chapterCount = CHAPTER_COUNTS[book] || 1;
  const verses = bibleData?.[book]?.[chapter - 1] || [];
  const displayVerses = verses.slice(verseFrom - 1, verseTo);
  const verseCountInChapter = verses.length || 30;

  const resetForm = () => {
    setSessionId(null);
    setObs(defaultObs());
    setInt(defaultInt());
    setApp(defaultApp());
    setIsCompleted(false);
  };

  const handleBookChange = (b) => {
    setBook(b); setChapter(1); setVerseFrom(1);
    setVerseTo(Math.min(5, CHAPTER_COUNTS[b] || 1));
    resetForm();
  };

  const handleChapterChange = (c) => {
    setChapter(c); setVerseFrom(1); setVerseTo(5); resetForm();
  };

  const handleLoadSession = (s) => {
    setBook(s.bookId); setChapter(s.chapter);
    setVerseFrom(s.verseFrom); setVerseTo(s.verseTo);
    setSessionId(s.id);
    setObs(safeJson(s.observationJson, defaultObs()));
    setInt(safeJson(s.interpretationJson, defaultInt()));
    setApp(safeJson(s.applicationJson, defaultApp()));
    setIsCompleted(s.isCompleted);
    setView('study');
    setBibleOpen(true);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        id: sessionId || undefined,
        bookId: book, chapter, verseFrom, verseTo,
        passage: `${BOOK_ID_TO_NAME[book] || book} ${chapter}:${verseFrom}–${verseTo}`,
        observationJson: JSON.stringify(obs),
        interpretationJson: JSON.stringify(int_),
        applicationJson: JSON.stringify(app),
        isCompleted, completedStepsJson: '[]', shareMode: 'private',
      };
      const saved = await apiClient.post('/api/bible-study-sessions', payload);
      setSessionId(saved.id);
      setToast({ type: 'success', msg: 'Đã lưu!' });
    } catch {
      setToast({ type: 'error', msg: 'Lưu thất bại' });
    } finally {
      setSaving(false);
    }
  }, [sessionId, book, chapter, verseFrom, verseTo, obs, int_, app, isCompleted]);

  const handleDelete = async (id) => {
    if (!confirm('Xóa phiên học này?')) return;
    try {
      await apiClient.delete(`/api/bible-study-sessions/${id}`);
      setHistory(h => h.filter(s => s.id !== id));
      setToast({ type: 'success', msg: 'Đã xóa' });
    } catch {
      setToast({ type: 'error', msg: 'Xóa thất bại' });
    }
  };

  return (
    <PageContainer title="Học Kinh Thánh" description="Phương pháp quy nạp OIA">
      {/* ── Header ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
          <IconBook size={24} /> Học Kinh Thánh
          {sessionId && <Chip label="Đang chỉnh sửa" size="small" color="primary" />}
        </Typography>
        <Box display="flex" gap={1}>
          {view === 'study' ? (
            <>
              <Button variant="outlined" size="small" startIcon={<IconPlus size={16} />} onClick={resetForm}>Mới</Button>
              <Button variant="outlined" size="small" startIcon={<IconHistory size={16} />} onClick={() => setView('history')}>Lịch sử</Button>
            </>
          ) : (
            <Button variant="outlined" size="small" startIcon={<IconArrowLeft size={16} />} onClick={() => setView('study')}>Quay lại</Button>
          )}
        </Box>
      </Box>

      {/* ── History view ── */}
      {view === 'history' && (
        <Box>
          {loadingHistory ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : history.length === 0 ? (
            <Alert severity="info">Chưa có phiên học nào. Hãy bắt đầu học!</Alert>
          ) : (
            <Grid container spacing={2}>
              {history.map(s => (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>{passageLabel(s)}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(s.createdAt)}</Typography>
                        </Box>
                        {s.isCompleted && <Chip label="Hoàn thành" size="small" color="success" />}
                      </Box>
                      <Box display="flex" gap={1} mt={2}>
                        <Button size="small" variant="contained" startIcon={<IconEdit size={14} />} onClick={() => handleLoadSession(s)}>Mở lại</Button>
                        <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><IconTrash size={16} /></IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ── Study view ── */}
      {view === 'study' && (
        <Grid container spacing={2}>
          {/* Left: Bible text (accordion) */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              {/* Accordion header */}
              <Box
                display="flex" alignItems="center" justifyContent="space-between"
                px={2} py={1} sx={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setBibleOpen(o => !o)}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  📖 {BOOK_ID_TO_NAME[book]} {chapter}:{verseFrom}–{verseTo}
                </Typography>
                <IconButton size="small" onClick={e => { e.stopPropagation(); setBibleOpen(o => !o); }}>
                  {bibleOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </IconButton>
              </Box>

              <Collapse in={bibleOpen}>
                <Divider />
                <CardContent sx={{ pt: 1, pb: 1 }}>
                  {/* Passage selector */}
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Sách</InputLabel>
                        <Select value={book} label="Sách" onChange={e => handleBookChange(e.target.value)}>
                          {BOOK_ORDER.map(b => (
                            <MenuItem key={b} value={b}>{BOOK_ID_TO_NAME[b] || b}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Chương</InputLabel>
                        <Select value={chapter} label="Chương" onChange={e => handleChapterChange(Number(e.target.value))}>
                          {Array.from({ length: chapterCount }, (_, i) => i + 1).map(c => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Từ câu</InputLabel>
                        <Select value={verseFrom} label="Từ câu" onChange={e => { const v = Number(e.target.value); setVerseFrom(v); if (verseTo < v) setVerseTo(v); }}>
                          {Array.from({ length: verseCountInChapter }, (_, i) => i + 1).map(v => (
                            <MenuItem key={v} value={v}>{v}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Đến câu</InputLabel>
                        <Select value={verseTo} label="Đến câu" onChange={e => setVerseTo(Number(e.target.value))}>
                          {Array.from({ length: verseCountInChapter }, (_, i) => i + 1).filter(v => v >= verseFrom).map(v => (
                            <MenuItem key={v} value={v}>{v}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Font controls */}
                  <Box display="flex" alignItems="center" gap={1} mt={1} flexWrap="wrap">
                    <Tooltip title="Chữ nhỏ hơn"><span>
                      <IconButton size="small" onClick={() => setFontSize(f => Math.max(12, f - 2))} disabled={fontSize <= 12}>
                        <IconTextDecrease size={16} />
                      </IconButton>
                    </span></Tooltip>
                    <Typography variant="caption" color="text.secondary" minWidth={30} textAlign="center">{fontSize}px</Typography>
                    <Tooltip title="Chữ lớn hơn"><span>
                      <IconButton size="small" onClick={() => setFontSize(f => Math.min(28, f + 2))} disabled={fontSize >= 28}>
                        <IconTextIncrease size={16} />
                      </IconButton>
                    </span></Tooltip>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <Select value={fontFamily} onChange={e => setFontFamily(e.target.value)} displayEmpty>
                        {FONTS.map(f => (
                          <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>{f.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>

                <Divider />

                {/* Bible text */}
                <Box sx={{ maxHeight: 360, overflowY: 'auto', p: 2, userSelect: 'text' }}>
                  {loadingBible ? (
                    <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
                  ) : displayVerses.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">Không có dữ liệu</Typography>
                  ) : (
                    displayVerses.map((text, i) => (
                      <Box key={i} mb={0.75} display="flex" gap={1}>
                        <Typography variant="body2" color="text.disabled" sx={{ minWidth: 22, fontSize: fontSize * 0.7, pt: '3px' }}>
                          {verseFrom + i}
                        </Typography>
                        <Typography sx={{ fontSize, lineHeight: 1.7, fontFamily }}>
                          {text}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Card>
          </Grid>

          {/* Right: OIA form */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined">
              <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', p: 2 }}>

                {/* O — Observation */}
                <Typography variant="subtitle1" fontWeight={700} color="warning.main" gutterBottom>
                  🟡 O — Quan sát
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
                  <OField label="Ai? (Nhân vật chính/phụ)" value={obs.characters} onChange={v => setObs(o => ({ ...o, characters: v }))} />
                  <OField label="Hành động gì? Điều gì xảy ra?" value={obs.actions} onChange={v => setObs(o => ({ ...o, actions: v }))} />
                  <OField label="Khi nào? Ở đâu?" value={obs.whereWhen} onChange={v => setObs(o => ({ ...o, whereWhen: v }))} />
                  <OField label="Từ lặp đi lặp lại?" value={obs.repeatedWords} onChange={v => setObs(o => ({ ...o, repeatedWords: v }))} />
                  <OField label="Từ nối (vì, nên, nhưng, vậy...)" value={obs.connectingWords} onChange={v => setObs(o => ({ ...o, connectingWords: v }))} />
                  <OField label="Mệnh lệnh / Lời hứa / Tương phản" value={obs.commands} onChange={v => setObs(o => ({ ...o, commands: v }))} />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* I — Interpretation */}
                <Typography variant="subtitle1" fontWeight={700} color="info.main" gutterBottom>
                  🔵 I — Giải nghĩa
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
                  <OField label="Ý chính của đoạn này là gì?" value={int_.mainIdea} onChange={v => setInt(i => ({ ...i, mainIdea: v }))} />
                  <OField label="Về Đức Chúa Trời?" value={int_.aboutGod} onChange={v => setInt(i => ({ ...i, aboutGod: v }))} />
                  <OField label="Về con người?" value={int_.aboutHuman} onChange={v => setInt(i => ({ ...i, aboutHuman: v }))} />
                  <OField label="Tại sao tác giả viết điều này?" value={int_.whyImportant} onChange={v => setInt(i => ({ ...i, whyImportant: v }))} />
                  <OField label="Bối cảnh lịch sử / văn hóa?" value={int_.context} onChange={v => setInt(i => ({ ...i, context: v }))} />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* A — Application */}
                <Typography variant="subtitle1" fontWeight={700} color="success.main" gutterBottom>
                  🟢 A — Áp dụng
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5} mb={1}>
                  <OField label="Hành động cụ thể mình sẽ làm là gì?" value={app.specificAction} onChange={v => setApp(a => ({ ...a, specificAction: v }))} />
                  <OField label="Khi nào thực hiện?" value={app.when} onChange={v => setApp(a => ({ ...a, when: v }))} />
                  <OField label="Trở ngại có thể gặp?" value={app.obstacles} onChange={v => setApp(a => ({ ...a, obstacles: v }))} />
                  <OField label="Thay đổi gì ngay hôm nay?" value={app.changeToday} onChange={v => setApp(a => ({ ...a, changeToday: v }))} />
                </Box>
              </Box>

              <Divider />
              <Box p={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu lại'}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast && <Alert severity={toast.type} onClose={() => setToast(null)}>{toast.msg}</Alert>}
      </Snackbar>
    </PageContainer>
  );
}
