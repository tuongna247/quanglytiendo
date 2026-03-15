'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// TABS and Button imports kept; TourTabNav replaces inline tab rendering
import { IconDeviceFloppy } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import HtmlEditor from '@/app/components/forms/form-tiptap/HtmlEditor';
import TourTabNav from '../_components/TourTabNav';
import { api } from '@/app/lib/api';

const LANGUAGES = [
  { value: 2, label: 'English' },
  { value: 1, label: 'Vietnam' },
  { value: 3, label: 'German' },
  { value: 4, label: 'French' },
  { value: 5, label: 'Danish' },
];


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
  searchKey: '',
  seoDescription: '',
  seoMeta: '',
  seoTitle: '',
  language: 2,
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

export default function TourEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/tour/${id}`),
      api.get('/tour/countries'),
    ]).then(([tour, countriesList]) => {
      if (!tour) { router.push('/apps/vinaday/tours'); return; }
      setForm({
        name: tour.name ?? '',
        description: tour.description ?? '',
        overview: tour.overview ?? '',
        duration: tour.duration ?? '',
        location: tour.location ?? '',
        priceFrom: tour.priceFrom ?? '',
        status: tour.status ?? 1,
        type: tour.type ?? 1,
        countryId: tour.countryId ?? '',
        searchKey: tour.searchKey ?? '',
        seoDescription: tour.seoDescription ?? '',
        seoMeta: tour.seoMeta ?? '',
        seoTitle: tour.seoTitle ?? '',
        language: tour.language ?? 2,
      });
      setCountries(countriesList || []);
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
      await api.put(`/tour/${id}`, {
        ...form,
        priceFrom: form.priceFrom === '' ? null : Number(form.priceFrom),
        countryId: form.countryId === '' ? null : Number(form.countryId),
      });
      router.push('/apps/vinaday/tours');
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Edit Tour" description="Edit Tour">
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Basic information - ${form.name}`} description="Edit Tour">
      <Typography variant="h4" mb={0.5}>Basic information</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>{form.name}</Typography>

      <Paper>
        {/* Top bar: Language + Tab buttons */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 2, pb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select name="language" value={form.language} onChange={handleChange}>
              {LANGUAGES.map((l) => (
                <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TourTabNav tourId={id} active="Basic Info" />
        </Stack>

        <Divider />

        {/* Form body */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <FormRow label="Title">
            <TextField fullWidth size="small" name="name" value={form.name} onChange={handleChange} placeholder="Title" required />
          </FormRow>

          <FormRow label="Type">
            <Select size="small" name="type" value={form.type} onChange={handleChange} disabled sx={{ minWidth: 200 }}>
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

          <FormRow label="Keys">
            <TextField fullWidth multiline rows={3} name="searchKey" value={form.searchKey} onChange={handleChange} placeholder="Search key" />
          </FormRow>

          <FormRow label="SEO Keyword">
            <TextField fullWidth multiline rows={3} name="seoMeta" value={form.seoMeta} onChange={handleChange} />
          </FormRow>

          <FormRow label="SEO Description">
            <TextField fullWidth multiline rows={3} name="seoDescription" value={form.seoDescription} onChange={handleChange} />
          </FormRow>

          <FormRow label="SEO Title">
            <TextField fullWidth multiline rows={3} name="seoTitle" value={form.seoTitle} onChange={handleChange} />
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
