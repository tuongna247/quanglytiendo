'use client';

// ── Download helpers ───────────────────────────────────────────────────────────

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function downloadCSV(rows, columns, filename) {
  // columns: [{ key, label }]
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body = rows.map(r =>
    columns.map(c => {
      const val = r[c.key] ?? '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [header, ...body].join('\r\n');
  // UTF-8 BOM so Excel opens Vietnamese correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
}

// ── File read helpers ──────────────────────────────────────────────────────────

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(Array.isArray(data) ? data : [data]);
      } catch {
        reject(new Error('File JSON không hợp lệ.'));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file.'));
    reader.readAsText(file, 'utf-8');
  });
}

export function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target.result.replace(/^\uFEFF/, ''); // strip BOM
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { resolve([]); return; }

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => {
          const vals = parseCSVLine(line);
          const obj = {};
          headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
          return obj;
        });
        resolve(rows);
      } catch {
        reject(new Error('File CSV không hợp lệ.'));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file.'));
    reader.readAsText(file, 'utf-8');
  });
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ── Column definitions per entity ─────────────────────────────────────────────

export const TASK_COLUMNS = [
  { key: 'title',       label: 'Tiêu đề' },
  { key: 'description', label: 'Mô tả' },
  { key: 'status',      label: 'Trạng thái' },
  { key: 'priority',    label: 'Ưu tiên' },
  { key: 'category',    label: 'Danh mục' },
  { key: 'dueDate',     label: 'Hạn' },
  { key: 'tags',        label: 'Tags' },
  { key: 'steps',       label: 'Các bước' },
];

export const PLANNER_COLUMNS = [
  { key: 'date',              label: 'Ngày' },
  { key: 'title',             label: 'Tiêu đề' },
  { key: 'notes',             label: 'Ghi chú' },
  { key: 'isDone',            label: 'Hoàn thành' },
  { key: 'priority',          label: 'Ưu tiên' },
  { key: 'estimatedMinutes',  label: 'Phút ước tính' },
];

export const TRANSACTION_COLUMNS = [
  { key: 'type',          label: 'Loại' },
  { key: 'amount',        label: 'Số tiền' },
  { key: 'category',      label: 'Danh mục' },
  { key: 'description',   label: 'Mô tả' },
  { key: 'date',          label: 'Ngày' },
  { key: 'paymentMethod', label: 'Phương thức' },
];

export const CALENDAR_COLUMNS = [
  { key: 'title',       label: 'Tiêu đề' },
  { key: 'description', label: 'Mô tả' },
  { key: 'startAt',     label: 'Bắt đầu' },
  { key: 'endAt',       label: 'Kết thúc' },
  { key: 'allDay',      label: 'Cả ngày' },
  { key: 'color',       label: 'Màu' },
  { key: 'category',    label: 'Danh mục' },
  { key: 'recurrence',  label: 'Lặp lại' },
];

// ── Strip server fields before export ─────────────────────────────────────────

export function stripServerFields(items, columns) {
  const keys = columns.map(c => c.key);
  return items.map(item => {
    const out = {};
    keys.forEach(k => { if (item[k] !== undefined) out[k] = item[k]; });
    return out;
  });
}

// ── Validators ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['todo', 'in-progress', 'done', 'cancelled'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateTasks(rows) {
  const errors = [];
  rows.forEach((r, i) => {
    if (!r.title?.trim()) errors.push(`Hàng ${i + 1}: thiếu tiêu đề`);
    if (r.status && !VALID_STATUSES.includes(r.status)) errors.push(`Hàng ${i + 1}: status không hợp lệ ("${r.status}")`);
    if (r.priority && !VALID_PRIORITIES.includes(r.priority)) errors.push(`Hàng ${i + 1}: priority không hợp lệ ("${r.priority}")`);
  });
  return errors;
}

export function validatePlanner(rows) {
  const errors = [];
  rows.forEach((r, i) => {
    if (!r.title?.trim()) errors.push(`Hàng ${i + 1}: thiếu tiêu đề`);
    if (!r.date || !DATE_RE.test(r.date)) errors.push(`Hàng ${i + 1}: date không hợp lệ (cần yyyy-MM-dd)`);
  });
  return errors;
}

export function validateTransactions(rows) {
  const errors = [];
  rows.forEach((r, i) => {
    if (!['income', 'expense'].includes(r.type)) errors.push(`Hàng ${i + 1}: type phải là "income" hoặc "expense"`);
    if (!r.amount || isNaN(Number(r.amount)) || Number(r.amount) <= 0) errors.push(`Hàng ${i + 1}: amount phải là số dương`);
    if (!r.date || !DATE_RE.test(r.date)) errors.push(`Hàng ${i + 1}: date không hợp lệ (cần yyyy-MM-dd)`);
  });
  return errors;
}

export function validateCalendar(rows) {
  const errors = [];
  rows.forEach((r, i) => {
    if (!r.title?.trim()) errors.push(`Hàng ${i + 1}: thiếu tiêu đề`);
    if (!r.startAt || isNaN(Date.parse(r.startAt))) errors.push(`Hàng ${i + 1}: startAt không hợp lệ`);
  });
  return errors;
}
