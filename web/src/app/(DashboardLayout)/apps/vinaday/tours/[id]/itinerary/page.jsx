'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import HtmlEditor from '@/app/components/forms/form-tiptap/HtmlEditor';
import TourTabNav from '../../_components/TourTabNav';
import { api } from '@/app/lib/api';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Brunch'];
const TRANSPORTS = ['Flight', 'Bus', 'Train', 'Boat', 'Car', 'Walking'];

const EMPTY_FORM = { sortOrder: 1, itininary: '', content: '', meal: '', transport: '' };

function ItineraryModal({ open, onClose, onSave, initial, tourType }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial || EMPTY_FORM); }, [initial]);

  const toggleList = (field, item) => {
    const parts = (form[field] || '').split(', ').filter(Boolean);
    const exists = parts.includes(item);
    const next = exists ? parts.filter((x) => x !== item) : [...parts, item];
    setForm((p) => ({ ...p, [field]: next.join(', ') }));
  };

  const checked = (field, item) => (form[field] || '').split(', ').includes(item);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.id ? 'Edit itinerary' : 'Add itinerary'}</DialogTitle>
      <DialogContent dividers>
        {tourType === 1 && (
          <>
            <Typography variant="body2" mb={0.5}>Day itinerary</Typography>
            <Select
              size="small" fullWidth
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
              sx={{ mb: 2 }}
            >
              {Array.from({ length: 29 }, (_, i) => i + 1).map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>

            <Typography variant="body2" mb={0.5}>Title</Typography>
            <TextField
              fullWidth size="small"
              value={form.itininary}
              onChange={(e) => setForm((p) => ({ ...p, itininary: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </>
        )}

        <Typography variant="body2" mb={0.5}>Content</Typography>
        <Box mb={2}>
          <HtmlEditor value={form.content} onChange={(html) => setForm((p) => ({ ...p, content: html }))} />
        </Box>

        <Typography variant="body2" mb={0.5}>Meal</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
          {MEALS.map((m) => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={checked('meal', m)} onChange={() => toggleList('meal', m)} />
              {m}
            </label>
          ))}
        </Stack>

        <Typography variant="body2" mb={0.5}>Transport</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {TRANSPORTS.map((t) => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={checked('transport', t)} onChange={() => toggleList('transport', t)} />
              {t}
            </label>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="success" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save itinerary'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TourItineraryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [tourType, setTourType] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchItems = () => {
    api.get(`/tour/${id}/itinerary`)
      .then((list) => setItems(list || []))
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      api.get(`/tour/${id}`),
      api.get(`/tour/${id}/itinerary`),
    ]).then(([tour, list]) => {
      setTourType(tour?.type ?? 1);
      setItems(list || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (form) => {
    if (editing?.id) {
      await api.put(`/tour/${id}/itinerary/${editing.id}`, form);
    } else {
      await api.post(`/tour/${id}/itinerary`, form);
    }
    fetchItems();
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Delete this itinerary?')) return;
    await api.delete(`/tour/${id}/itinerary/${itemId}`);
    fetchItems();
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };

  return (
    <PageContainer title="Tour Itinerary" description="Tour Itinerary">
      <Typography variant="h4" mb={0.5}>Tour Itinerary</Typography>
      <Stack direction="row" gap={0.5} mb={3}>
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }} onClick={() => router.push('/apps/vinaday/tours')}>Tour</Typography>
        <Typography variant="body2" color="textSecondary">/ Tour Itinerary Management</Typography>
      </Stack>

      <Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2, pb: 1 }}>
          <TourTabNav tourId={id} active="Itinerary" />
        </Stack>
        <Divider />

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <>
              {/* Timeline list */}
              {items.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                        {tourType === 1 && (
                          <Box sx={{ bgcolor: 'success.main', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                            {item.sortOrder}
                          </Box>
                        )}
                        <Typography variant="subtitle1" fontWeight={600}>{item.itininary}</Typography>
                      </Stack>
                      <Box dangerouslySetInnerHTML={{ __html: item.content || '' }} sx={{ mb: 1 }} />
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" gap={3}>
                        {item.meal && <Typography variant="body2"><strong>Meal:</strong> {item.meal.replace(/, $/, '')}</Typography>}
                        {item.transport && <Typography variant="body2"><strong>Transport:</strong> {item.transport.replace(/, $/, '')}</Typography>}
                      </Stack>
                      {tourType === 1 && (
                        <Typography variant="caption" color="textSecondary">Day {item.sortOrder}</Typography>
                      )}
                    </Box>
                    <Stack direction="row" gap={0.5} ml={2}>
                      <IconButton size="small" color="success" onClick={() => openEdit(item)}><IconEdit size={16} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><IconTrash size={16} /></IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              ))}

              {/* Add new */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button variant="contained" color="success" size="small" startIcon={<IconPlus size={16} />} onClick={openAdd}>
                  Add new
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="contained" color="success" href={`/apps/vinaday/tours/${id}/rates`}>
              Save and Continue
            </Button>
            <Button variant="outlined" href="/apps/vinaday/tours">Cancel</Button>
          </Box>
        </Box>
      </Paper>

      <ItineraryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
        tourType={tourType}
      />
    </PageContainer>
  );
}
