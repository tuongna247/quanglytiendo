'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { IconArrowLeft, IconPrinter, IconEdit } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import { api } from '@/app/lib/api';

const STATUS_MAP = {
  1:  { label: 'Holding',       color: 'default' },
  2:  { label: 'Confirmed',     color: 'success' },
  3:  { label: 'Deposit',       color: 'info' },
  4:  { label: 'Cancelled',     color: 'error' },
  5:  { label: 'Refunded',      color: 'warning' },
  6:  { label: 'Amended',       color: 'secondary' },
  40: { label: 'Cancel w/ Fee', color: 'error' },
};

const PAYMENT_METHODS = { 1: 'Cash', 2: 'Card', 3: 'Bank Transfer', 4: 'Online' };

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

function InfoRow({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 600, width: '40%', color: 'text.secondary', border: 'none', py: 0.8 }}>
        {label}
      </TableCell>
      <TableCell sx={{ border: 'none', py: 0.8 }}>{value ?? '—'}</TableCell>
    </TableRow>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog,  setDialog]  = useState(null);  // null | 'paid' | 'deposit' | 'cancel' | 'refund' | 'amend'
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/admin/booking/${id}`)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handlePrint = () => window.print();

  const openDialog = (type) => {
    setForm({});
    setDialog(type);
  };

  const handleStatusUpdate = async (statusCode) => {
    setSaving(true);
    try {
      await api.put(`/admin/booking/${id}/status`, {
        status:   statusCode,
        note:     form.note     || null,
        decParam: form.decParam ? parseFloat(form.decParam) : null,
        strParam: form.strParam || null,
        intParam: form.intParam ? parseInt(form.intParam) : null,
        newDate:  form.newDate  || null,
      });
      setToast({ severity: 'success', message: 'Order updated successfully' });
      setDialog(null);
      load();
    } catch (e) {
      setToast({ severity: 'error', message: e.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) return <Typography>Order not found</Typography>;

  const st = STATUS_MAP[order.status] ?? { label: `#${order.status}`, color: 'default' };

  return (
    <PageContainer title={`Order #${order.id}`} description="Order Detail">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Button startIcon={<IconArrowLeft size={18} />} onClick={() => router.back()} size="small">
            Back
          </Button>
          <Typography variant="h4">
            Order #{order.id} &nbsp;
            <Chip label={order.pnr} size="small" color="primary" sx={{ fontWeight: 700 }} />
          </Typography>
          <Chip label={st.label} color={st.color} />
        </Stack>
        <Stack direction="row" gap={1}>
          <Button startIcon={<IconPrinter size={18} />} onClick={handlePrint} variant="outlined" size="small">
            Print
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} id="print-section">
            <Typography variant="h6" mb={1}>Order Information</Typography>
            <Divider sx={{ mb: 1 }} />
            <Table size="small">
              <TableBody>
                <InfoRow label="Product / Tour" value={order.productName} />
                <InfoRow label="Start Date"     value={fmtDate(order.startDate)} />
                <InfoRow label="Adults"         value={order.quantity} />
                <InfoRow label="Children"       value={order.children} />
                <InfoRow label="Departure"      value={order.departureOption} />
                <InfoRow label="Group Type"     value={order.groupType} />
                <InfoRow label="Special Request" value={order.specialRequest} />
                <InfoRow label="Cancellation"   value={order.cancellationPolicy} />
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Financial */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>Financial</Typography>
            <Divider sx={{ mb: 1 }} />
            <Table size="small">
              <TableBody>
                <InfoRow label="Price (per person)"  value={fmtMoney(order.price)} />
                <InfoRow label="Tax / Commission"    value={fmtMoney(order.taxFee)} />
                <InfoRow label="Discount"            value={order.discount ? `${fmtMoney(order.discount)} (${order.discountName})` : '—'} />
                <InfoRow label="Total Amount"        value={<strong>{fmtMoney(order.amount)}</strong>} />
                <InfoRow label="Deposit Paid"        value={fmtMoney(order.deposit)} />
                <InfoRow label="Payment Method"      value={PAYMENT_METHODS[order.paymentMethod] ?? '—'} />
                <InfoRow label="Rate Exchange"       value={order.rateExchange ? `${Number(order.rateExchange).toLocaleString()} VND` : '—'} />
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Guest */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>Guest</Typography>
            <Divider sx={{ mb: 1 }} />
            <Table size="small">
              <TableBody>
                <InfoRow label="Name"        value={`${order.guestFirstName || ''} ${order.guestLastName || ''}`.trim()} />
                <InfoRow label="Email"       value={order.customerEmail} />
                <InfoRow label="Phone"       value={order.customerPhone} />
                <InfoRow label="Country"     value={order.guestCountry} />
                <InfoRow label="Managed by"  value={order.management} />
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Status Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Button variant="contained" color="success" size="small"
                onClick={() => openDialog('paid')} disabled={order.status === 2}>
                Mark Paid
              </Button>
              <Button variant="outlined" color="info" size="small"
                onClick={() => openDialog('deposit')} disabled={order.status === 4}>
                Add Deposit
              </Button>
              <Button variant="outlined" color="secondary" size="small"
                onClick={() => openDialog('amend')} disabled={order.status === 4}>
                Amend Date
              </Button>
              <Button variant="outlined" color="warning" size="small"
                onClick={() => openDialog('refund')} disabled={order.status === 4}>
                Refund
              </Button>
              <Button variant="outlined" color="error" size="small"
                onClick={() => openDialog('cancel')} disabled={order.status === 4}>
                Cancel
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* History */}
        {order.history?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={1}>History Log</Typography>
              <Divider sx={{ mb: 1 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell>By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{new Date(h.createdDate).toLocaleString('en-GB')}</TableCell>
                        <TableCell>{h.changedName}</TableCell>
                        <TableCell>{h.changedValue}</TableCell>
                        <TableCell>{h.note}</TableCell>
                        <TableCell>{h.userId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ── Dialogs ── */}

      {/* Mark Paid */}
      <Dialog open={dialog === 'paid'} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark as Paid</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={form.intParam || ''}
              label="Payment Method"
              onChange={(e) => setForm({ ...form, intParam: e.target.value })}
            >
              {Object.entries(PAYMENT_METHODS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth size="small" label="Card / Reference Number"
            value={form.strParam || ''} onChange={(e) => setForm({ ...form, strParam: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth size="small" label="Note"
            value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={() => handleStatusUpdate(2)} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm Paid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Deposit */}
      <Dialog open={dialog === 'deposit'} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Deposit</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="Deposit Amount ($)" type="number"
            value={form.decParam || ''} onChange={(e) => setForm({ ...form, decParam: e.target.value })}
            sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth size="small" label="Note"
            value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" color="info" onClick={() => handleStatusUpdate(3)} disabled={saving}>
            {saving ? 'Saving...' : 'Add Deposit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Amend Date */}
      <Dialog open={dialog === 'amend'} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Amend Start Date</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="New Start Date" type="date"
            InputLabelProps={{ shrink: true }}
            value={form.newDate || ''} onChange={(e) => setForm({ ...form, newDate: e.target.value })}
            sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth size="small" label="Note"
            value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={() => handleStatusUpdate(6)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Amendment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund */}
      <Dialog open={dialog === 'refund'} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="Refund Amount ($)" type="number"
            value={form.decParam || ''} onChange={(e) => setForm({ ...form, decParam: e.target.value })}
            sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth size="small" label="Note"
            value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={() => handleStatusUpdate(5)} disabled={saving}>
            {saving ? 'Saving...' : 'Process Refund'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel */}
      <Dialog open={dialog === 'cancel'} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <TextField fullWidth size="small" label="Cancellation Fee ($) — leave 0 for no fee" type="number"
            value={form.decParam || ''} onChange={(e) => setForm({ ...form, decParam: e.target.value })}
            sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth size="small" label="Reason / Note"
            value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Back</Button>
          <Button variant="contained" color="error" onClick={() => handleStatusUpdate(4)} disabled={saving}>
            {saving ? 'Saving...' : 'Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast?.severity} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          nav, header, aside, button, .MuiSnackbar-root { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </PageContainer>
  );
}
