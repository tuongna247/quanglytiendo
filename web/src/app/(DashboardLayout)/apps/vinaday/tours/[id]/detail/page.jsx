'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconDeviceFloppy } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import HtmlEditor from '@/app/components/forms/form-tiptap/HtmlEditor';
import TourTabNav from '../../_components/TourTabNav';
import { api } from '@/app/lib/api';

const GROUP_SIZES = ['1-5', '6-10', '11-15', '16-20', '21-30', '30+'];

const EMPTY_FORM = {
  start: '',
  finish: '',
  groupSize: '',
  includeActivity: '',
  excludeActivity: '',
  duration: '',
  notes: '',
  cancelationPolicy: '',
};

function FormRow({ label, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      <Typography variant="body2" sx={{ width: 160, minWidth: 160, pt: 1, fontWeight: 500, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

export default function TourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [tourName, setTourName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tour/${id}`)
      .then((tour) => {
        if (!tour) { router.push('/apps/vinaday/tours'); return; }
        setTourName(tour.name ?? '');
        setForm({
          start: tour.start ?? '',
          finish: tour.finish ?? '',
          groupSize: tour.groupSize ?? '',
          includeActivity: tour.includeActivity ?? '',
          excludeActivity: tour.excludeActivity ?? '',
          duration: tour.duration ?? '',
          notes: tour.notes ?? '',
          cancelationPolicy: tour.cancelationPolicy ?? '',
        });
      })
      .catch(() => setError('Failed to load tour.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/tour/${id}/detail`, {
        ...form,
        cancelationPolicy: form.cancelationPolicy === '' ? null : Number(form.cancelationPolicy),
      });
      router.push(`/apps/vinaday/tours/${id}/photos`);
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Detail information" description="Tour Detail">
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Detail information" description="Tour Detail">
      <Typography variant="h4" mb={0.5}>Detail information</Typography>
      <Stack direction="row" gap={0.5} mb={3}>
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }} onClick={() => router.push('/apps/vinaday/tours')}>Tour</Typography>
        <Typography variant="body2" color="textSecondary">/ Detail Management</Typography>
      </Stack>

      <Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2, pb: 1 }}>
          <TourTabNav tourId={id} active="Detail" />
        </Stack>
        <Divider />

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <FormRow label="Start">
            <TextField fullWidth size="small" name="start" value={form.start} onChange={handleChange} placeholder="Start location" />
          </FormRow>

          <FormRow label="Finish">
            <TextField fullWidth size="small" name="finish" value={form.finish} onChange={handleChange} placeholder="Finish location" />
          </FormRow>

          <FormRow label="Group size">
            <Select size="small" name="groupSize" value={form.groupSize} onChange={handleChange} displayEmpty sx={{ minWidth: 200 }}>
              <MenuItem value=""><em>— Select —</em></MenuItem>
              {GROUP_SIZES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormRow>

          <FormRow label="Include">
            <HtmlEditor value={form.includeActivity} onChange={(html) => setForm((p) => ({ ...p, includeActivity: html }))} />
          </FormRow>

          <FormRow label="Exclude">
            <HtmlEditor value={form.excludeActivity} onChange={(html) => setForm((p) => ({ ...p, excludeActivity: html }))} />
          </FormRow>

          <FormRow label="Duration">
            <TextField fullWidth size="small" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3 days 2 nights" />
          </FormRow>

          <FormRow label="Notes">
            <HtmlEditor value={form.notes} onChange={(html) => setForm((p) => ({ ...p, notes: html }))} />
          </FormRow>

          {error && <Typography color="error" mb={2}>{error}</Typography>}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="success" startIcon={<IconDeviceFloppy size={18} />} disabled={saving}>
              {saving ? 'Saving…' : 'Save and continue'}
            </Button>
            <Button variant="outlined" href="/apps/vinaday/tours">Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </PageContainer>
  );
}
