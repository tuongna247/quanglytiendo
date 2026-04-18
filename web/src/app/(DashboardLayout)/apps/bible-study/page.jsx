'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
  IconDownload,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconX,
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

// ── Default form states ───────────────────────────────────────────────────────
const defaultObs = () => ({ characters: '', actions: '', whereWhen: '', repeatedWords: '', connectingWords: '', commands: '' });
const defaultInt = () => ({ mainIdea: '', whyImportant: '', aboutGod: '', aboutHuman: '', context: '' });
const defaultApp = () => ({ specificAction: '', when: '', obstacles: '', changeToday: '' });
const defaultInteractive = () => ({ standoutVerse: '', aboutGod: '', aboutMe: '', questions: '', connection: '', prayerResponse: '' });
const defaultHTH = () => ({ head: '', heart: '', hand: '' });

const safeJson = (str, fallback) => { try { return JSON.parse(str) || fallback; } catch { return fallback; } };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function passageLabel(session) {
  const book = BOOK_ID_TO_NAME[session.bookId] || session.bookId;
  return `${book} ${session.chapter}:${session.verseFrom}–${session.verseTo}`;
}

// ── OField with optional insert button ───────────────────────────────────────
function OField({ label, value, onChange, minRows = 1, onInsert, hasSelection }) {
  return (
    <Box sx={{ position: 'relative' }}>
      {hasSelection && onInsert && (
        <Tooltip title="Chèn đoạn đang chọn vào đây">
          <IconButton
            size="small" color="primary" onClick={onInsert}
            sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'primary.main', width: 22, height: 22 }}
          >
            <IconPlus size={12} />
          </IconButton>
        </Tooltip>
      )}
      <TextField
        fullWidth multiline minRows={minRows} maxRows={6}
        label={label} value={value}
        onChange={e => onChange(e.target.value)}
        size="small"
        sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start' } }}
      />
    </Box>
  );
}

// ── Selected text bar ─────────────────────────────────────────────────────────
function SelectionBar({ text, onClear }) {
  if (!text) return null;
  const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
  return (
    <Box display="flex" alignItems="center" gap={1} px={1.5} py={0.75}
      sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', borderRadius: 1, mb: 1.5 }}
    >
      <Typography variant="caption" color="primary.main" sx={{ flex: 1, fontStyle: 'italic' }}>
        📌 "{preview}"
      </Typography>
      <Tooltip title="Xóa chọn">
        <IconButton size="small" onClick={onClear}><IconX size={12} /></IconButton>
      </Tooltip>
    </Box>
  );
}

// ── Study method forms ────────────────────────────────────────────────────────
function InteractiveForm({ data, onChange, selectedText }) {
  const ins = (key) => () => onChange({ ...data, [key]: data[key] + (data[key] ? '\n> ' : '> ') + selectedText });
  const f = (key) => (v) => onChange({ ...data, [key]: v });
  const has = !!selectedText;
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography variant="caption" color="text.secondary">Đọc đoạn kinh và trả lời theo cảm nhận tự nhiên.</Typography>
      <OField label="📌 Câu / đoạn nào nổi bật với bạn?" value={data.standoutVerse} onChange={f('standoutVerse')} minRows={2} onInsert={ins('standoutVerse')} hasSelection={has} />
      <OField label="🙏 Về Đức Chúa Trời?" value={data.aboutGod} onChange={f('aboutGod')} onInsert={ins('aboutGod')} hasSelection={has} />
      <OField label="🪞 Về bạn / con người?" value={data.aboutMe} onChange={f('aboutMe')} onInsert={ins('aboutMe')} hasSelection={has} />
      <OField label="❓ Câu hỏi nào nảy sinh?" value={data.questions} onChange={f('questions')} onInsert={ins('questions')} hasSelection={has} />
      <OField label="🔗 Kết nối với cuộc sống hiện tại?" value={data.connection} onChange={f('connection')} onInsert={ins('connection')} hasSelection={has} />
      <OField label="💬 Lời cầu nguyện đáp lại Chúa" value={data.prayerResponse} onChange={f('prayerResponse')} minRows={3} onInsert={ins('prayerResponse')} hasSelection={has} />
    </Box>
  );
}

function OIAForm({ obs, setObs, int_, setInt, app, setApp, selectedText }) {
  const has = !!selectedText;
  const ins = (setter, key) => () => setter(o => ({ ...o, [key]: o[key] + (o[key] ? '\n> ' : '> ') + selectedText }));
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="warning.main" gutterBottom>🟡 O — Quan sát</Typography>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <OField label="Ai? (Nhân vật chính/phụ)" value={obs.characters} onChange={v => setObs(o => ({ ...o, characters: v }))} onInsert={ins(setObs, 'characters')} hasSelection={has} />
          <OField label="Hành động gì? Điều gì xảy ra?" value={obs.actions} onChange={v => setObs(o => ({ ...o, actions: v }))} onInsert={ins(setObs, 'actions')} hasSelection={has} />
          <OField label="Khi nào? Ở đâu?" value={obs.whereWhen} onChange={v => setObs(o => ({ ...o, whereWhen: v }))} onInsert={ins(setObs, 'whereWhen')} hasSelection={has} />
          <OField label="Từ lặp đi lặp lại?" value={obs.repeatedWords} onChange={v => setObs(o => ({ ...o, repeatedWords: v }))} onInsert={ins(setObs, 'repeatedWords')} hasSelection={has} />
          <OField label="Từ nối (vì, nên, nhưng, vậy...)" value={obs.connectingWords} onChange={v => setObs(o => ({ ...o, connectingWords: v }))} onInsert={ins(setObs, 'connectingWords')} hasSelection={has} />
          <OField label="Mệnh lệnh / Lời hứa / Tương phản" value={obs.commands} onChange={v => setObs(o => ({ ...o, commands: v }))} onInsert={ins(setObs, 'commands')} hasSelection={has} />
        </Box>
      </Box>
      <Divider />
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="info.main" gutterBottom>🔵 I — Giải nghĩa</Typography>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <OField label="Ý chính của đoạn này là gì?" value={int_.mainIdea} onChange={v => setInt(i => ({ ...i, mainIdea: v }))} onInsert={ins(setInt, 'mainIdea')} hasSelection={has} />
          <OField label="Về Đức Chúa Trời?" value={int_.aboutGod} onChange={v => setInt(i => ({ ...i, aboutGod: v }))} onInsert={ins(setInt, 'aboutGod')} hasSelection={has} />
          <OField label="Về con người?" value={int_.aboutHuman} onChange={v => setInt(i => ({ ...i, aboutHuman: v }))} onInsert={ins(setInt, 'aboutHuman')} hasSelection={has} />
          <OField label="Tại sao tác giả viết điều này?" value={int_.whyImportant} onChange={v => setInt(i => ({ ...i, whyImportant: v }))} onInsert={ins(setInt, 'whyImportant')} hasSelection={has} />
          <OField label="Bối cảnh lịch sử / văn hóa?" value={int_.context} onChange={v => setInt(i => ({ ...i, context: v }))} onInsert={ins(setInt, 'context')} hasSelection={has} />
        </Box>
      </Box>
      <Divider />
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="success.main" gutterBottom>🟢 A — Áp dụng</Typography>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <OField label="Hành động cụ thể mình sẽ làm là gì?" value={app.specificAction} onChange={v => setApp(a => ({ ...a, specificAction: v }))} onInsert={ins(setApp, 'specificAction')} hasSelection={has} />
          <OField label="Khi nào thực hiện?" value={app.when} onChange={v => setApp(a => ({ ...a, when: v }))} onInsert={ins(setApp, 'when')} hasSelection={has} />
          <OField label="Trở ngại có thể gặp?" value={app.obstacles} onChange={v => setApp(a => ({ ...a, obstacles: v }))} onInsert={ins(setApp, 'obstacles')} hasSelection={has} />
          <OField label="Thay đổi gì ngay hôm nay?" value={app.changeToday} onChange={v => setApp(a => ({ ...a, changeToday: v }))} onInsert={ins(setApp, 'changeToday')} hasSelection={has} />
        </Box>
      </Box>
    </Box>
  );
}

function HTHForm({ data, onChange, selectedText }) {
  const has = !!selectedText;
  const ins = (key) => () => onChange({ ...data, [key]: data[key] + (data[key] ? '\n> ' : '> ') + selectedText });
  const f = (key) => (v) => onChange({ ...data, [key]: v });
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="caption" color="text.secondary">Mỗi phần phản ánh một chiều tiếp nhận Lời Chúa.</Typography>
      <Card variant="outlined" sx={{ p: 2, borderLeft: '4px solid', borderColor: 'info.main' }}>
        <Typography variant="subtitle2" fontWeight={700} color="info.main" gutterBottom>🧠 Đầu — Tôi học được gì?</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>Sự thật nào Kinh Thánh dạy? Tôi hiểu thêm điều gì?</Typography>
        <OField label="Ghi chép..." value={data.head} onChange={f('head')} minRows={3} onInsert={ins('head')} hasSelection={has} />
      </Card>
      <Card variant="outlined" sx={{ p: 2, borderLeft: '4px solid', borderColor: 'error.main' }}>
        <Typography variant="subtitle2" fontWeight={700} color="error.main" gutterBottom>❤️ Tim — Điều gì chạm đến lòng tôi?</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>Cảm xúc, xác tín, thách thức hay an ủi nào?</Typography>
        <OField label="Ghi chép..." value={data.heart} onChange={f('heart')} minRows={3} onInsert={ins('heart')} hasSelection={has} />
      </Card>
      <Card variant="outlined" sx={{ p: 2, borderLeft: '4px solid', borderColor: 'success.main' }}>
        <Typography variant="subtitle2" fontWeight={700} color="success.main" gutterBottom>🤲 Tay — Tôi sẽ làm gì?</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>Hành động cụ thể, thay đổi thái độ, hay điều cần cầu nguyện?</Typography>
        <OField label="Ghi chép..." value={data.hand} onChange={f('hand')} minRows={3} onInsert={ins('hand')} hasSelection={has} />
      </Card>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BibleStudyPage() {
  const { user } = useAuth();
  const [view, setView] = useState('study');
  const [studyMethod, setStudyMethod] = useState('oia');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBibleText, setSelectedBibleText] = useState('');

  // passage
  const [book, setBook] = useState('ph');
  const [chapter, setChapter] = useState(1);
  const [verseFrom, setVerseFrom] = useState(1);
  const [verseTo, setVerseTo] = useState(5);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('inherit');

  // bible data
  const [bibleData, setBibleData] = useState(null);
  const [loadingBible, setLoadingBible] = useState(false);

  // form state
  const [sessionId, setSessionId] = useState(null);
  const [obs, setObs] = useState(defaultObs());
  const [int_, setInt] = useState(defaultInt());
  const [app, setApp] = useState(defaultApp());
  const [interactive, setInteractive] = useState(defaultInteractive());
  const [hth, setHth] = useState(defaultHTH());
  const [isCompleted, setIsCompleted] = useState(false);

  // history
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ui
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

  const handleBibleMouseUp = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel) setSelectedBibleText(sel);
  };

  const resetForm = () => {
    setSessionId(null);
    setObs(defaultObs()); setInt(defaultInt()); setApp(defaultApp());
    setInteractive(defaultInteractive()); setHth(defaultHTH());
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
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        id: sessionId || undefined,
        bookId: book, chapter, verseFrom, verseTo,
        passage: `${BOOK_ID_TO_NAME[book] || book} ${chapter}:${verseFrom}–${verseTo}`,
        observationJson: JSON.stringify(studyMethod === 'interactive' ? interactive : studyMethod === 'hth' ? hth : obs),
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
  }, [sessionId, book, chapter, verseFrom, verseTo, obs, int_, app, interactive, hth, studyMethod, isCompleted]);

  const handleExportWord = useCallback(async () => {
    const passage = `${BOOK_ID_TO_NAME[book] || book} ${chapter}:${verseFrom}–${verseTo}`;
    const dateStr = new Date().toLocaleDateString('vi-VN');
    const fieldRow = (label, value) => [
      new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22 })], spacing: { before: 160, after: 40 } }),
      new Paragraph({ text: value || '(chưa điền)', spacing: { after: 80 } }),
    ];
    const methodTitles = { interactive: 'TƯƠNG TÁC THÁNH KINH', oia: 'HỌC KINH THÁNH QUY NẠP (OIA)', hth: 'ĐẦU - TIM - TAY' };
    let bodyParagraphs = [];
    if (studyMethod === 'oia') {
      bodyParagraphs = [
        new Paragraph({ text: 'O — QUAN SÁT', heading: HeadingLevel.HEADING_2 }),
        ...fieldRow('Ai?', obs.characters), ...fieldRow('Hành động?', obs.actions),
        ...fieldRow('Khi nào? Ở đâu?', obs.whereWhen), ...fieldRow('Từ lặp?', obs.repeatedWords),
        ...fieldRow('Từ nối?', obs.connectingWords), ...fieldRow('Mệnh lệnh/Lời hứa?', obs.commands),
        new Paragraph({ text: 'I — GIẢI NGHĨA', heading: HeadingLevel.HEADING_2 }),
        ...fieldRow('Ý chính?', int_.mainIdea), ...fieldRow('Về Đức Chúa Trời?', int_.aboutGod),
        ...fieldRow('Về con người?', int_.aboutHuman), ...fieldRow('Tại sao?', int_.whyImportant), ...fieldRow('Bối cảnh?', int_.context),
        new Paragraph({ text: 'A — ÁP DỤNG', heading: HeadingLevel.HEADING_2 }),
        ...fieldRow('Hành động cụ thể?', app.specificAction), ...fieldRow('Khi nào?', app.when),
        ...fieldRow('Trở ngại?', app.obstacles), ...fieldRow('Thay đổi hôm nay?', app.changeToday),
      ];
    } else if (studyMethod === 'interactive') {
      bodyParagraphs = [
        ...fieldRow('Câu nổi bật?', interactive.standoutVerse), ...fieldRow('Về Đức Chúa Trời?', interactive.aboutGod),
        ...fieldRow('Về bạn?', interactive.aboutMe), ...fieldRow('Câu hỏi?', interactive.questions),
        ...fieldRow('Kết nối?', interactive.connection), ...fieldRow('Cầu nguyện?', interactive.prayerResponse),
      ];
    } else {
      bodyParagraphs = [
        new Paragraph({ text: '🧠 ĐẦU', heading: HeadingLevel.HEADING_2 }), ...fieldRow('', hth.head),
        new Paragraph({ text: '❤️ TIM', heading: HeadingLevel.HEADING_2 }), ...fieldRow('', hth.heart),
        new Paragraph({ text: '🤲 TAY', heading: HeadingLevel.HEADING_2 }), ...fieldRow('', hth.hand),
      ];
    }
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: methodTitles[studyMethod], heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `Đoạn: ${passage}  |  Ngày: ${dateStr}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
          ...bodyParagraphs,
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KinhThanh_${passage.replace(/[:\s–]/g, '_')}_${dateStr.replace(/\//g, '-')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [book, chapter, verseFrom, verseTo, obs, int_, app, interactive, hth, studyMethod]);

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

  // ── Reusable panels ──────────────────────────────────────────────────────────
  const biblePanel = (
    <Box sx={{ width: '42%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box p={1.5} pb={1}>
          <Box display="flex" flexDirection="column" gap={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Sách</InputLabel>
              <Select value={book} label="Sách" onChange={e => handleBookChange(e.target.value)}>
                {BOOK_ORDER.map(b => <MenuItem key={b} value={b}>{BOOK_ID_TO_NAME[b] || b}</MenuItem>)}
              </Select>
            </FormControl>
            <Box display="flex" gap={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Chương</InputLabel>
                <Select value={chapter} label="Chương" onChange={e => handleChapterChange(Number(e.target.value))}>
                  {Array.from({ length: chapterCount }, (_, i) => i + 1).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Từ câu</InputLabel>
                <Select value={verseFrom} label="Từ câu" onChange={e => { const v = Number(e.target.value); setVerseFrom(v); if (verseTo < v) setVerseTo(v); }}>
                  {Array.from({ length: verseCountInChapter }, (_, i) => i + 1).map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Đến câu</InputLabel>
                <Select value={verseTo} label="Đến câu" onChange={e => setVerseTo(Number(e.target.value))}>
                  {Array.from({ length: verseCountInChapter }, (_, i) => i + 1).filter(v => v >= verseFrom).map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Tooltip title="Chữ nhỏ hơn"><span>
                <IconButton size="small" onClick={() => setFontSize(f => Math.max(12, f - 2))} disabled={fontSize <= 12}><IconTextDecrease size={16} /></IconButton>
              </span></Tooltip>
              <Typography variant="caption" color="text.secondary" minWidth={28} textAlign="center">{fontSize}px</Typography>
              <Tooltip title="Chữ lớn hơn"><span>
                <IconButton size="small" onClick={() => setFontSize(f => Math.min(28, f + 2))} disabled={fontSize >= 28}><IconTextIncrease size={16} /></IconButton>
              </span></Tooltip>
              <FormControl size="small" sx={{ minWidth: 110, ml: 0.5 }}>
                <Select value={fontFamily} onChange={e => setFontFamily(e.target.value)} displayEmpty>
                  {FONTS.map(f => <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>{f.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
        <Divider />
        <Box
          sx={{ flex: 1, overflowY: 'auto', p: 2, userSelect: 'text' }}
          onMouseUp={handleBibleMouseUp}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
            📖 {BOOK_ID_TO_NAME[book]} {chapter}:{verseFrom}–{verseTo}
          </Typography>
          {loadingBible ? (
            <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
          ) : displayVerses.length === 0 ? (
            <Typography color="text.secondary" variant="body2">Không có dữ liệu</Typography>
          ) : (
            displayVerses.map((text, i) => (
              <Box key={i} mb={1} display="flex" gap={1}>
                <Typography variant="body2" color="text.disabled" sx={{ minWidth: 22, fontSize: fontSize * 0.7, pt: '3px', flexShrink: 0 }}>
                  {verseFrom + i}
                </Typography>
                <Typography sx={{ fontSize, lineHeight: 1.8, fontFamily }}>{text}</Typography>
              </Box>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );

  const studyPanel = (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box display="flex" alignItems="center" sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Tabs value={studyMethod} onChange={(_, v) => setStudyMethod(v)} sx={{ flex: 1 }}>
            <Tab label="Tương Tác" value="interactive" />
            <Tab label="Quy Nạp (OIA)" value="oia" />
            <Tab label="Đầu · Tim · Tay" value="hth" />
          </Tabs>
          <Tooltip title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
            <IconButton size="small" sx={{ mr: 1 }} onClick={() => setIsFullscreen(f => !f)}>
              {isFullscreen ? <IconArrowsMinimize size={18} /> : <IconArrowsMaximize size={18} />}
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <SelectionBar text={selectedBibleText} onClear={() => setSelectedBibleText('')} />
          {studyMethod === 'interactive' && <InteractiveForm data={interactive} onChange={setInteractive} selectedText={selectedBibleText} />}
          {studyMethod === 'oia' && <OIAForm obs={obs} setObs={setObs} int_={int_} setInt={setInt} app={app} setApp={setApp} selectedText={selectedBibleText} />}
          {studyMethod === 'hth' && <HTHForm data={hth} onChange={setHth} selectedText={selectedBibleText} />}
        </Box>
        <Divider />
        <Box p={1.5} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" size="small" startIcon={<IconDownload size={16} />} onClick={handleExportWord}>Xuất Word</Button>
          <Button variant="contained" size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <IconDeviceFloppy size={16} />}
            onClick={handleSave} disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu lại'}
          </Button>
        </Box>
      </Card>
    </Box>
  );

  const twoColumnLayout = (
    <Box display="flex" gap={2} sx={{ height: 'calc(100vh - 160px)' }}>
      {biblePanel}
      {studyPanel}
    </Box>
  );

  return (
    <>
      {/* ── Full-screen overlay ── */}
      {isFullscreen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300, bgcolor: 'background.default', p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
              <IconBook size={20} /> Học Kinh Thánh
              {sessionId && <Chip label="Đang chỉnh sửa" size="small" color="primary" />}
            </Typography>
            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" startIcon={<IconPlus size={16} />} onClick={resetForm}>Mới</Button>
              <Button variant="outlined" size="small" startIcon={<IconHistory size={16} />} onClick={() => { setIsFullscreen(false); setView('history'); }}>Lịch sử</Button>
            </Box>
          </Box>
          <Box display="flex" gap={2} sx={{ flex: 1, overflow: 'hidden' }}>
            {biblePanel}
            {studyPanel}
          </Box>
        </Box>
      )}

      {/* ── Normal page ── */}
      {!isFullscreen && (
        <PageContainer title="Học Kinh Thánh" description="Phương pháp học Kinh Thánh">
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

          {view === 'history' && (
            <Box>
              {loadingHistory ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
              ) : history.length === 0 ? (
                <Alert severity="info">Chưa có phiên học nào. Hãy bắt đầu học!</Alert>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  {history.map(s => (
                    <Card variant="outlined" key={s.id}>
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
                  ))}
                </Box>
              )}
            </Box>
          )}

          {view === 'study' && twoColumnLayout}
        </PageContainer>
      )}

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast && <Alert severity={toast.type} onClose={() => setToast(null)}>{toast.msg}</Alert>}
      </Snackbar>
    </>
  );
}
