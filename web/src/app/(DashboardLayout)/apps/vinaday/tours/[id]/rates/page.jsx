'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconChevronDown, IconPlus, IconTrash } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import TourTabNav from '../../_components/TourTabNav';
import { api } from '@/app/lib/api';

function calcNet(retail, commission) {
  const r = parseFloat(retail) || 0;
  const c = parseFloat(commission) || 0;
  return (r + r * c / 100).toFixed(2);
}
function calcTotal(retail, commission, persons) {
  const net = parseFloat(calcNet(retail, commission));
  const p = parseInt(persons) || 0;
  return (net * p).toFixed(2);
}

function RatesTable({ rows, commission, onChangeRow, onDeleteRow, onAddRow }) {
  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">No. Person</TableCell>
            <TableCell align="center">Retail rate</TableCell>
            <TableCell align="center">Net rate</TableCell>
            <TableCell align="center">Commission rate</TableCell>
            <TableCell align="center">Total rate</TableCell>
            <TableCell align="center" sx={{ width: 60 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                <TextField size="small" type="number" value={row.personNo ?? ''} inputProps={{ min: 1 }} sx={{ width: 80 }}
                  onChange={(e) => onChangeRow(i, 'personNo', e.target.value)} />
              </TableCell>
              <TableCell>
                <TextField size="small" type="number" value={row.retailRate ?? ''} inputProps={{ min: 0, step: 0.01 }} sx={{ width: 110 }}
                  onChange={(e) => onChangeRow(i, 'retailRate', e.target.value)} />
              </TableCell>
              <TableCell align="center">
                <TextField size="small" value={calcNet(row.retailRate, commission)} disabled sx={{ width: 110 }} />
              </TableCell>
              <TableCell align="center">
                <TextField size="small" value={commission} disabled sx={{ width: 80 }} />
              </TableCell>
              <TableCell align="center">
                <TextField size="small" value={calcTotal(row.retailRate, commission, row.personNo)} disabled sx={{ width: 110 }} />
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" color="error" onClick={() => onDeleteRow(i, row.id)}>
                  <IconTrash size={16} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box mt={1}>
        <Button size="small" variant="outlined" color="success" startIcon={<IconPlus size={14} />} onClick={onAddRow}>
          Add more
        </Button>
      </Box>
    </Box>
  );
}

export default function TourRatesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [basicRows, setBasicRows] = useState([]);
  const [expandGroups, setExpandGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [addExpandOpen, setAddExpandOpen] = useState(false);
  const [newExpand, setNewExpand] = useState({ name: '', startDate: '', endDate: '' });

  const fetchData = () => {
    api.get(`/tour/${id}/rates`).then((d) => {
      setData(d);
      setBasicRows(d?.basicRates?.map((r) => ({ ...r })) || []);
      setExpandGroups(d?.expandRates?.map((g) => ({ ...g, prices: g.prices.map((p) => ({ ...p })) })) || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const commission = data?.commissionRate ?? 0;

  // Basic rows
  const handleBasicChange = (i, field, value) => {
    setBasicRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };
  const handleAddBasicRow = () => setBasicRows((prev) => [...prev, { personNo: '', retailRate: '' }]);
  const handleDeleteBasicRow = async (i, rowId) => {
    if (rowId) await api.delete(`/tour/${id}/rates/basic/${rowId}`);
    setBasicRows((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleSaveBasic = async () => {
    setSaving(true);
    await api.post(`/tour/${id}/rates/basic`, basicRows.map((r) => ({
      id: r.id || null,
      personNo: parseInt(r.personNo) || null,
      retailRate: parseFloat(r.retailRate) || null,
    })));
    fetchData();
    setSaving(false);
  };

  // Expand groups
  const handleExpandPriceChange = (gi, pi, field, value) => {
    setExpandGroups((prev) => prev.map((g, gIdx) => gIdx !== gi ? g : {
      ...g,
      prices: g.prices.map((p, pIdx) => pIdx !== pi ? p : { ...p, [field]: value })
    }));
  };
  const handleAddExpandRow = (gi) => {
    setExpandGroups((prev) => prev.map((g, gIdx) => gIdx !== gi ? g : { ...g, prices: [...g.prices, { personNo: '', retailRate: '' }] }));
  };
  const handleDeleteExpandRow = async (gi, pi, rateId) => {
    const group = expandGroups[gi];
    if (rateId) await api.delete(`/tour/${id}/rates/expand/${group.id}/prices/${rateId}`);
    setExpandGroups((prev) => prev.map((g, gIdx) => gIdx !== gi ? g : { ...g, prices: g.prices.filter((_, idx) => idx !== pi) }));
  };
  const handleSaveExpandPrices = async (gi) => {
    setSaving(true);
    const group = expandGroups[gi];
    await api.post(`/tour/${id}/rates/expand/${group.id}/prices`, group.prices.map((p) => ({
      id: p.id || null,
      personNo: parseInt(p.personNo) || null,
      retailRate: parseFloat(p.retailRate) || null,
    })));
    fetchData();
    setSaving(false);
  };
  const handleDeleteExpand = async (gi) => {
    if (!confirm('Delete this expand price group?')) return;
    const group = expandGroups[gi];
    await api.delete(`/tour/${id}/rates/expand/${group.id}`);
    fetchData();
  };
  const handleAddExpand = async () => {
    await api.post(`/tour/${id}/rates/expand`, {
      name: newExpand.name,
      startDate: newExpand.startDate || null,
      endDate: newExpand.endDate || null,
    });
    setAddExpandOpen(false);
    setNewExpand({ name: '', startDate: '', endDate: '' });
    fetchData();
  };

  if (loading) return (
    <PageContainer title="Rates Control" description="Rates Control">
      <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
    </PageContainer>
  );

  return (
    <PageContainer title="Rates Control" description="Rates Control">
      <Typography variant="h4" mb={0.5}>Basic information</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>{data?.name}</Typography>

      <Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2, pb: 1 }}>
          <TourTabNav tourId={id} active="Rates Control" />
        </Stack>
        <Divider />

        <Box sx={{ p: 2 }}>
          {/* Basic Price */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<IconChevronDown size={18} />} sx={{ bgcolor: 'primary.main', color: 'white', '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' } }}>
              <Typography fontWeight={600}>Basic Price</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RatesTable
                rows={basicRows}
                commission={commission}
                onChangeRow={handleBasicChange}
                onDeleteRow={handleDeleteBasicRow}
                onAddRow={handleAddBasicRow}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" color="success" size="small" onClick={handleSaveBasic} disabled={saving}>
                  Save All Basic Price
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Expand Price */}
          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<IconChevronDown size={18} />} sx={{ bgcolor: 'success.main', color: 'white', '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' } }}>
              <Typography fontWeight={600}>Expand Price</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button size="small" onClick={() => setAddExpandOpen(true)}>Add Expand Price</Button>
              </Box>

              {expandGroups.map((group, gi) => (
                <Box key={group.id} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {group.name} ({group.startDate} - {group.endDate})
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => handleDeleteExpand(gi)}>
                      <IconTrash size={16} />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ my: 0.5 }} />
                  <RatesTable
                    rows={group.prices}
                    commission={commission}
                    onChangeRow={(pi, field, value) => handleExpandPriceChange(gi, pi, field, value)}
                    onDeleteRow={(pi, rateId) => handleDeleteExpandRow(gi, pi, rateId)}
                    onAddRow={() => handleAddExpandRow(gi)}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button size="small" variant="contained" color="success" onClick={() => handleSaveExpandPrices(gi)} disabled={saving}>
                      Save Expand Price
                    </Button>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="contained" color="success" href={`/apps/vinaday/tours/${id}/surcharges`}>
              Save and Continue
            </Button>
            <Button variant="outlined" href="/apps/vinaday/tours">Cancel</Button>
          </Box>
        </Box>
      </Paper>

      {/* Add Expand Price Dialog */}
      <Dialog open={addExpandOpen} onClose={() => setAddExpandOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Range</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth size="small" label="Expand Price Name" value={newExpand.name}
            onChange={(e) => setNewExpand((p) => ({ ...p, name: e.target.value }))} sx={{ mb: 2 }} />
          <Stack direction="row" gap={1}>
            <TextField size="small" label="Start Date" type="date" value={newExpand.startDate} InputLabelProps={{ shrink: true }}
              onChange={(e) => setNewExpand((p) => ({ ...p, startDate: e.target.value }))} sx={{ flex: 1 }} />
            <TextField size="small" label="End Date" type="date" value={newExpand.endDate} InputLabelProps={{ shrink: true }}
              onChange={(e) => setNewExpand((p) => ({ ...p, endDate: e.target.value }))} sx={{ flex: 1 }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExpandOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" fullWidth onClick={handleAddExpand}>Add</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
