'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { api } from '@/app/lib/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  overview: '',
  duration: '',
  location: '',
  priceFrom: '',
  status: 1,
  type: 1,
  countryId: '',
};

function FormRow({ label, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      <Typography
        variant="body2"
        sx={{ width: 160, minWidth: 160, pt: 1, fontWeight: 500, color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

export default function TourNewPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    api.get('/tour/countries').then((list) => setCountries(list || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await api.post('/tour', {
        ...form,
        priceFrom: form.priceFrom === '' ? null : Number(form.priceFrom),
        countryId: form.countryId === '' ? null : Number(form.countryId),
        language: 2,
      });
      if (created?.id) {
        router.push(`/apps/vinaday/tours/${created.id}`);
      } else {
        router.push('/apps/vinaday/tours');
      }
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title="Add new tour" description="Add new tour">
      <Typography variant="h4" mb={0.5}>Basic information</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>Add new tour</Typography>

      <Paper>
        <Divider />
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <FormRow label="Title">
            <TextField fullWidth size="small" name="name" value={form.name} onChange={handleChange} placeholder="Title" required />
          </FormRow>

          <FormRow label="Type">
            <Select size="small" name="type" value={form.type} onChange={handleChange} sx={{ minWidth: 200 }}>
              <MenuItem value={1}>Tour</MenuItem>
              <MenuItem value={2}>Day trip</MenuItem>
            </Select>
          </FormRow>

          <FormRow label="Country">
            <Select size="small" name="countryId" value={form.countryId} onChange={handleChange} displayEmpty sx={{ minWidth: 260 }}>
              <MenuItem value=""><em>— Select country —</em></MenuItem>
              {countries.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormRow>

          <FormRow label="Location">
            <TextField fullWidth size="small" name="location" value={form.location} onChange={handleChange} placeholder="Location" />
          </FormRow>

          <FormRow label="Duration">
            <TextField fullWidth size="small" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3 days 2 nights" />
          </FormRow>

          <FormRow label="Price From">
            <TextField size="small" name="priceFrom" type="number" value={form.priceFrom} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} sx={{ width: 200 }} />
          </FormRow>

          <FormRow label="Status">
            <Select size="small" name="status" value={form.status} onChange={handleChange} sx={{ minWidth: 200 }}>
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
              <MenuItem value={2}>Draft</MenuItem>
            </Select>
          </FormRow>

          <FormRow label="Description">
            <HtmlEditor value={form.description} onChange={(html) => setForm((p) => ({ ...p, description: html }))} />
          </FormRow>

          <FormRow label="Over View">
            <HtmlEditor value={form.overview} onChange={(html) => setForm((p) => ({ ...p, overview: html }))} />
          </FormRow>

          {error && <Typography color="error" mb={2}>{error}</Typography>}

          <Stack direction="row" justifyContent="flex-end" gap={2} mt={2}>
            <Button type="submit" variant="contained" color="success" startIcon={<IconDeviceFloppy size={18} />} disabled={saving}>
              {saving ? 'Saving…' : 'Create and continue'}
            </Button>
            <Button variant="outlined" href="/apps/vinaday/tours">Cancel</Button>
          </Stack>
        </Box>
      </Paper>
    </PageContainer>
  );
}
