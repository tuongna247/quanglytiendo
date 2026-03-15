'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { api } from '@/app/lib/api';

const PAYMENT_METHODS = [
  { value: 1, label: 'Cash' },
  { value: 2, label: 'Card' },
  { value: 3, label: 'Bank Transfer' },
  { value: 4, label: 'Online' },
];

const STATUS_OPTIONS = [
  { value: 1, label: 'Holding (not paid)' },
  { value: 2, label: 'Paid / Confirmed' },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0); // 0 = Tour, 1 = Other Service

  // Shared state
  const [nationalities, setNationalities] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  // Tour order state
  const [tours,     setTours]     = useState([]);
  const [rates,     setRates]     = useState([]);
  const [rateType,  setRateType]  = useState(1);
  const [tourForm,  setTourForm]  = useState({
    tourId: '', checkInDate: '', adults: 1, children: 0,
    rateType: 1, discount: 0, discountName: 'Special Sale',
    status: 1, paymentMethod: 1, departureTime: '',
    email: '', firstName: '', lastName: '', phone: '',
    nationalityId: '', specialRequest: '',
  });

  // Other service state
  const [svcForm, setSvcForm] = useState({
    productName: '', checkInDate: '', quantity: 1,
    price: 0, amount: 0, discount: 0, discountName: '',
    cancellationPolicy: '', status: 1, paymentMethod: 1,
    email: '', firstName: '', lastName: '', phone: '',
    nationalityId: '', specialRequest: '',
  });

  // Load shared data
  useEffect(() => {
    api.get('/nationalities').then(setNationalities).catch(() => {});
    api.get('/tour?page=1&pageSize=200').then((r) => setTours(r?.items || [])).catch(() => {});
  }, []);

  // Load rates when tour or rateType changes
  useEffect(() => {
    if (!tourForm.tourId) { setRates([]); return; }
    api.get(`/admin/booking/tour-rates/${tourForm.tourId}?rateType=${rateType}`)
      .then(setRates).catch(() => setRates([]));
  }, [tourForm.tourId, rateType]);

  // Customer lookup
  const lookupCustomer = async (field, value) => {
    if (!value) return;
    const setter = tab === 0 ? setTourForm : setSvcForm;
    const qs = field === 'email' ? `email=${encodeURIComponent(value)}` : `phone=${encodeURIComponent(value)}`;
    const cust = await api.get(`/admin/booking/customer-lookup?${qs}`).catch(() => null);
    if (cust) {
      setter((prev) => ({
        ...prev,
        firstName:     cust.firstname    || prev.firstName,
        lastName:      cust.lastname     || prev.lastName,
        phone:         cust.phonenumber  || prev.phone,
        email:         cust.email        || prev.email,
        nationalityId: cust.nationalid   || prev.nationalityId,
      }));
      setToast({ severity: 'info', message: 'Customer found and prefilled' });
    }
  };

  // Submit Tour Order
  const handleSubmitTour = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/booking/tour-order', {
        ...tourForm,
        tourId:     parseInt(tourForm.tourId),
        adults:     parseInt(tourForm.adults),
        children:   parseInt(tourForm.children),
        rateType:   parseInt(rateType),
        discount:   parseFloat(tourForm.discount) || 0,
        status:     parseInt(tourForm.status),
        paymentMethod: parseInt(tourForm.paymentMethod),
        nationalityId: tourForm.nationalityId ? parseInt(tourForm.nationalityId) : null,
      });
      setToast({ severity: 'success', message: `Created! PNR: ${res.pnr}` });
      setTimeout(() => router.push(`/apps/vinaday/orders/${res.orderId}`), 1500);
    } catch (err) {
      setToast({ severity: 'error', message: err.message || 'Failed to create order' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Other Service Order
  const handleSubmitSvc = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/booking/other-order', {
        ...svcForm,
        quantity:   parseInt(svcForm.quantity),
        price:      parseFloat(svcForm.price) || 0,
        amount:     parseFloat(svcForm.amount) || 0,
        discount:   parseFloat(svcForm.discount) || 0,
        status:     parseInt(svcForm.status),
        paymentMethod: parseInt(svcForm.paymentMethod),
        nationalityId: svcForm.nationalityId ? parseInt(svcForm.nationalityId) : null,
      });
      setToast({ severity: 'success', message: `Created! PNR: ${res.pnr}` });
      setTimeout(() => router.push(`/apps/vinaday/orders/${res.orderId}`), 1500);
    } catch (err) {
      setToast({ severity: 'error', message: err.message || 'Failed to create order' });
    } finally {
      setSaving(false);
    }
  };

  const tField = (key) => ({
    value: tourForm[key] ?? '',
    onChange: (e) => setTourForm({ ...tourForm, [key]: e.target.value }),
  });

  const sField = (key) => ({
    value: svcForm[key] ?? '',
    onChange: (e) => setSvcForm({ ...svcForm, [key]: e.target.value }),
  });

  return (
    <PageContainer title="New Order" description="Create Tour or Other Service Order">
      <Stack direction="row" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<IconArrowLeft size={18} />} onClick={() => router.back()} size="small">
          Back
        </Button>
        <Typography variant="h4">New Order</Typography>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Tour Order" />
        <Tab label="Other Service" />
      </Tabs>

      {/* ── TOUR ORDER ── */}
      {tab === 0 && (
        <Box component="form" onSubmit={handleSubmitTour}>
          <Grid container spacing={3}>

            {/* Product */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Tour Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Select Tour</InputLabel>
                      <Select
                        value={tourForm.tourId}
                        label="Select Tour"
                        onChange={(e) => setTourForm({ ...tourForm, tourId: e.target.value })}
                      >
                        {tours.map((t) => (
                          <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Check-in / Departure Date"
                      type="date" InputLabelProps={{ shrink: true }} required {...tField('checkInDate')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Adults" type="number"
                      inputProps={{ min: 1 }} required {...tField('adults')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Children" type="number"
                      inputProps={{ min: 0 }} {...tField('children')} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rate Option</InputLabel>
                      <Select
                        value={rateType}
                        label="Rate Option"
                        onChange={(e) => { setRateType(e.target.value); setTourForm({ ...tourForm, rateType: e.target.value }); }}
                      >
                        <MenuItem value={1}>Group Option 1</MenuItem>
                        <MenuItem value={2}>Group Option 2</MenuItem>
                        <MenuItem value={3}>Group Option 3</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" label="Departure Time" {...tField('departureTime')} />
                  </Grid>

                  {/* Rate table */}
                  {rates.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        Available Rates (select persons matching Adults):
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {rates.map((r) => (
                          <Box key={r.id} sx={{
                            border: '1px solid', borderColor: 'divider', borderRadius: 1,
                            px: 2, py: 1, fontSize: 13, bgcolor: 'background.paper'
                          }}>
                            <strong>{r.personNo} pax</strong> — ${r.retailRate} retail
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Discount ($)" type="number"
                      inputProps={{ min: 0, step: '0.01' }} {...tField('discount')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Discount Label" {...tField('discountName')} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Guest */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Guest / Customer</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Email" type="email" required
                      {...tField('email')}
                      onBlur={(e) => lookupCustomer('email', e.target.value)} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="First Name" required {...tField('firstName')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Last Name" required {...tField('lastName')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Phone"
                      {...tField('phone')}
                      onBlur={(e) => lookupCustomer('phone', e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Nationality</InputLabel>
                      <Select value={tourForm.nationalityId || ''} label="Nationality"
                        onChange={(e) => setTourForm({ ...tourForm, nationalityId: e.target.value })}>
                        <MenuItem value="">—</MenuItem>
                        {nationalities.map((n) => (
                          <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Special Request" multiline rows={2}
                      {...tField('specialRequest')} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Payment */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Payment</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select value={tourForm.status} label="Status"
                        onChange={(e) => setTourForm({ ...tourForm, status: e.target.value })}>
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {parseInt(tourForm.status) === 2 && (
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Payment Method</InputLabel>
                        <Select value={tourForm.paymentMethod} label="Payment Method"
                          onChange={(e) => setTourForm({ ...tourForm, paymentMethod: e.target.value })}>
                          {PAYMENT_METHODS.map((m) => (
                            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <IconDeviceFloppy size={18} />}
                disabled={saving}>
                {saving ? 'Creating...' : 'Create Tour Order'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── OTHER SERVICE ── */}
      {tab === 1 && (
        <Box component="form" onSubmit={handleSubmitSvc}>
          <Grid container spacing={3}>

            {/* Service Details */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Service Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth size="small" label="Service / Product Name" required {...sField('productName')} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size="small" label="Date" type="date"
                      InputLabelProps={{ shrink: true }} required {...sField('checkInDate')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Quantity" type="number"
                      inputProps={{ min: 1 }} required {...sField('quantity')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Price per unit ($)" type="number"
                      inputProps={{ min: 0, step: '0.01' }} required {...sField('price')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Total Amount ($)" type="number"
                      inputProps={{ min: 0, step: '0.01' }} required {...sField('amount')} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField fullWidth size="small" label="Discount ($)" type="number"
                      inputProps={{ min: 0, step: '0.01' }} {...sField('discount')} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Discount Label" {...sField('discountName')} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Cancellation Policy" {...sField('cancellationPolicy')} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Guest */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Guest / Customer</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Email" type="email" required
                      {...sField('email')}
                      onBlur={(e) => lookupCustomer('email', e.target.value)} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="First Name" required {...sField('firstName')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Last Name" required {...sField('lastName')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Phone"
                      {...sField('phone')}
                      onBlur={(e) => lookupCustomer('phone', e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Nationality</InputLabel>
                      <Select value={svcForm.nationalityId || ''} label="Nationality"
                        onChange={(e) => setSvcForm({ ...svcForm, nationalityId: e.target.value })}>
                        <MenuItem value="">—</MenuItem>
                        {nationalities.map((n) => (
                          <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Special Request" multiline rows={2}
                      {...sField('specialRequest')} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Payment */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Payment</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select value={svcForm.status} label="Status"
                        onChange={(e) => setSvcForm({ ...svcForm, status: e.target.value })}>
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {parseInt(svcForm.status) === 2 && (
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Payment Method</InputLabel>
                        <Select value={svcForm.paymentMethod} label="Payment Method"
                          onChange={(e) => setSvcForm({ ...svcForm, paymentMethod: e.target.value })}>
                          {PAYMENT_METHODS.map((m) => (
                            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <IconDeviceFloppy size={18} />}
                disabled={saving}>
                {saving ? 'Creating...' : 'Create Service Order'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Toast */}
      <Snackbar open={!!toast} autoHideDuration={5000} onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast?.severity} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
