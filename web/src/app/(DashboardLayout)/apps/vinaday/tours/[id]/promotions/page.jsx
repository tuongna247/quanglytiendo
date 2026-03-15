'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MuiStep from '@mui/material/Step';
import MuiStepLabel from '@mui/material/StepLabel';
import MuiStepper from '@mui/material/Stepper';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import TourTabNav from '../../_components/TourTabNav';
import { api } from '@/app/lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STEPS = ['Promotion Type', 'Condition', 'Benefit', 'Restriction', 'Summary'];

const DISCOUNT_TYPE_LABELS = { 1: '% Discount', 3: 'Amount Discount Per People' };
const LANGUAGE_LABELS = { 0: 'All Languages', 1: 'English', 2: 'VietNam' };

const EMPTY_FORM = {
  promotionType: '',
  promotionTypeName: '',
  checkIn: '', checkOut: '',
  bookingDateFrom: '', bookingDateTo: '',
  days: [...DAYS],
  discountType: 1,
  get: 0,
  numberPerson: 0,
  language: 0,
  minimumDayAdvance: 0,
};

function PromotionWizard({ open, onClose, onSave, promotionTypes }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setStep(0); setForm(EMPTY_FORM); } }, [open]);

  const toggleDay = (day) => {
    setForm((p) => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter((d) => d !== day) : [...p.days, day],
    }));
  };

  const isEarlyBird = form.promotionType === 1;

  const buildSummary = () => ({
    name: form.promotionTypeName || 'Promotion',
    promotionType: form.promotionType,
    checkIn: form.checkIn || null,
    checkOut: form.checkOut || null,
    bookingDateFrom: isEarlyBird ? null : (form.bookingDateFrom || null),
    bookingDateTo: isEarlyBird ? null : (form.bookingDateTo || null),
    dateOfWeek: form.days.join(','),
    discountType: form.discountType,
    get: parseFloat(form.get) || 0,
    numberPerson: parseInt(form.numberPerson) || 0,
    language: parseInt(form.language) || 0,
    minimumDayAdvance: isEarlyBird ? (parseInt(form.minimumDayAdvance) || 0) : null,
  });

  const handleFinish = async () => {
    setSaving(true);
    await onSave(buildSummary());
    setSaving(false);
    onClose();
  };

  const stepContent = [
    // Step 1 - Promotion Type
    <Box key="s1">
      <Typography mb={1}>Select promotion type:</Typography>
      <Select size="small" value={form.promotionType} displayEmpty sx={{ minWidth: 220 }}
        onChange={(e) => {
          const pt = promotionTypes.find((t) => t.id === e.target.value);
          setForm((p) => ({ ...p, promotionType: e.target.value, promotionTypeName: pt?.name || '' }));
        }}>
        <MenuItem value=""><em>— Select —</em></MenuItem>
        {promotionTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
      </Select>
    </Box>,

    // Step 2 - Condition
    <Box key="s2">
      <Stack direction="row" gap={2} mb={2}>
        <Box>
          <Typography variant="body2" mb={0.5}>Stay date from</Typography>
          <TextField size="small" type="date" value={form.checkIn} InputLabelProps={{ shrink: true }}
            onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))} />
        </Box>
        <Box>
          <Typography variant="body2" mb={0.5}>to</Typography>
          <TextField size="small" type="date" value={form.checkOut} InputLabelProps={{ shrink: true }}
            onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))} />
        </Box>
      </Stack>
      {isEarlyBird ? (
        <Box mb={2}>
          <Typography variant="body2" mb={0.5}>Booking before (days)</Typography>
          <TextField size="small" type="number" value={form.minimumDayAdvance}
            onChange={(e) => setForm((p) => ({ ...p, minimumDayAdvance: e.target.value }))} />
        </Box>
      ) : (
        <Stack direction="row" gap={2} mb={2}>
          <Box>
            <Typography variant="body2" mb={0.5}>Book date from</Typography>
            <TextField size="small" type="date" value={form.bookingDateFrom} InputLabelProps={{ shrink: true }}
              onChange={(e) => setForm((p) => ({ ...p, bookingDateFrom: e.target.value }))} />
          </Box>
          <Box>
            <Typography variant="body2" mb={0.5}>to</Typography>
            <TextField size="small" type="date" value={form.bookingDateTo} InputLabelProps={{ shrink: true }}
              onChange={(e) => setForm((p) => ({ ...p, bookingDateTo: e.target.value }))} />
          </Box>
        </Stack>
      )}
      <Typography variant="body2" mb={0.5}>Check-in on:</Typography>
      <Box sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', borderRadius: 1, p: 1, display: 'inline-flex', gap: 1, flexWrap: 'wrap' }}>
        {DAYS.map((day) => (
          <FormControlLabel key={day} label={day} sx={{ mr: 0 }}
            control={<Checkbox size="small" checked={form.days.includes(day)} onChange={() => toggleDay(day)} />} />
        ))}
      </Box>
    </Box>,

    // Step 3 - Benefit
    <Box key="s3">
      <Stack direction="row" gap={2} alignItems="flex-end">
        <Box>
          <Typography variant="body2" mb={0.5}>Discount type</Typography>
          <Select size="small" value={form.discountType} sx={{ minWidth: 220 }}
            onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
            <MenuItem value={1}>% Discount</MenuItem>
            <MenuItem value={3}>Amount Discount Per People</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography variant="body2" mb={0.5}>Get</Typography>
          <TextField size="small" type="number" value={form.get} sx={{ width: 100 }}
            onChange={(e) => setForm((p) => ({ ...p, get: e.target.value }))} />
        </Box>
        <Typography variant="body2" color="textSecondary">
          {form.discountType === 1 ? '% Discount' : 'USD Discount per person'}
        </Typography>
      </Stack>
    </Box>,

    // Step 4 - Restriction
    <Box key="s4">
      <Stack direction="row" gap={3} mb={2}>
        <Box>
          <Typography variant="body2" mb={0.5}>Person Apply</Typography>
          <Select size="small" value={form.numberPerson} sx={{ minWidth: 120 }}
            onChange={(e) => setForm((p) => ({ ...p, numberPerson: e.target.value }))}>
            <MenuItem value={0}>All person</MenuItem>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </Select>
        </Box>
        <Box>
          <Typography variant="body2" mb={0.5}>Languages</Typography>
          <Select size="small" value={form.language} sx={{ minWidth: 150 }}
            onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}>
            <MenuItem value={0}>All Languages</MenuItem>
            <MenuItem value={1}>English</MenuItem>
            <MenuItem value={2}>VietNam</MenuItem>
          </Select>
        </Box>
      </Stack>
    </Box>,

    // Step 5 - Summary
    <Box key="s5" sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200', borderRadius: 1, p: 2 }}>
      <Typography><strong>Promotion name:</strong> {form.promotionTypeName}</Typography>
      <Typography><strong>Check-in on:</strong> {form.days.join(', ')}</Typography>
      {isEarlyBird
        ? <Typography><strong>Booking before:</strong> {form.minimumDayAdvance} day(s)</Typography>
        : <Typography><strong>Booking date:</strong> {form.bookingDateFrom} - {form.bookingDateTo}</Typography>
      }
      <Typography><strong>Stay date:</strong> {form.checkIn} - {form.checkOut}</Typography>
      <Typography><strong>Person:</strong> {form.numberPerson === 0 ? 'All person' : form.numberPerson}</Typography>
      <Typography><strong>Languages:</strong> {LANGUAGE_LABELS[form.language]}</Typography>
      <Typography><strong>Discount type:</strong> {DISCOUNT_TYPE_LABELS[form.discountType]}</Typography>
      <Typography><strong>Get:</strong> {form.get}{form.discountType === 1 ? '% Discount' : ' USD per person'}</Typography>
    </Box>,
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add new promotion</DialogTitle>
      <DialogContent dividers>
        <MuiStepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <MuiStep key={label}><MuiStepLabel>{label}</MuiStepLabel></MuiStep>
          ))}
        </MuiStepper>
        {stepContent[step]}
      </DialogContent>
      <DialogActions>
        <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Previous</Button>
        {step < STEPS.length - 1
          ? <Button variant="contained" onClick={() => setStep((s) => s + 1)}>Next</Button>
          : <Button variant="contained" color="success" onClick={handleFinish} disabled={saving}>
              {saving ? 'Saving…' : 'Finish'}
            </Button>
        }
      </DialogActions>
    </Dialog>
  );
}

export default function TourPromotionsPage() {
  const { id } = useParams();
  const [promotions, setPromotions] = useState([]);
  const [promotionTypes, setPromotionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/tour/${id}/promotions`),
      api.get('/promotion-types'),
    ]).then(([list, types]) => {
      setPromotions(list || []);
      setPromotionTypes(types || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSave = async (data) => {
    await api.post(`/tour/${id}/promotions`, data);
    fetchData();
  };

  const handleDelete = async (promoId) => {
    if (!confirm('Delete this promotion?')) return;
    await api.delete(`/tour/${id}/promotions/${promoId}`);
    fetchData();
  };

  const formatBookingDate = (p) => {
    if (p.promotionType === 1)
      return `Booking before ${p.minimumDayAdvance} ${p.minimumDayAdvance > 1 ? 'days' : 'day'}`;
    return `${p.bookingDateFrom ?? ''} to ${p.bookingDateTo ?? ''}`;
  };

  const formatDiscount = (p) => {
    if (p.discountType === 1) return `Get ${p.get}% discount.`;
    return `Get $${p.get} discount on every people.`;
  };

  return (
    <PageContainer title="Tour Promotion" description="Tour Promotion">
      <Typography variant="h4" mb={0.5}>Tour Promotion</Typography>

      <Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2, pb: 1 }}>
          <TourTabNav tourId={id} active="Promotions" />
        </Stack>
        <Divider />

        <Box sx={{ p: 3 }}>
          <Box mb={2}>
            <Button variant="contained" color="info" size="small" startIcon={<IconPlus size={14} />} onClick={() => setModalOpen(true)}>
              Add new
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Promotion name</TableCell>
                  <TableCell>Booking date</TableCell>
                  <TableCell>Stay date</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Person</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No content for this time.</Typography>
                    </TableCell>
                  </TableRow>
                ) : promotions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>
                      <div>{formatBookingDate(p)}</div>
                      <Typography variant="caption" color="textSecondary">({p.dateOfWeek})</Typography>
                    </TableCell>
                    <TableCell>{p.checkIn ?? ''} to {p.checkOut ?? ''}</TableCell>
                    <TableCell>{LANGUAGE_LABELS[p.language ?? 0] ?? 'All Languages'}</TableCell>
                    <TableCell>{!p.numberPerson ? 'All Person' : p.numberPerson}</TableCell>
                    <TableCell>{formatDiscount(p)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                        <IconTrash size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" href="/apps/vinaday/tours">Back to Tours</Button>
          </Box>
        </Box>
      </Paper>

      <PromotionWizard
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        promotionTypes={promotionTypes}
      />
    </PageContainer>
  );
}
