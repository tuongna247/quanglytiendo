'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import PageContainer from '@/app/components/container/PageContainer';
import TourTabNav from '../../_components/TourTabNav';
import { api } from '@/app/lib/api';

const MEDIA_TYPES = { 1: 'Banner', 2: 'Gallery', 3: 'Logo', 4: 'Map' };
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5227';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vinaday_token');
}

export default function TourPhotosPage() {
  const { id } = useParams();
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [edits, setEdits] = useState({});

  const fetchPhotos = () => {
    setLoading(true);
    api.get(`/tour/${id}/media`)
      .then((list) => setPhotos(list || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPhotos(); }, [id]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((f) => formData.append('files', f));

    const token = getToken();
    await fetch(`${API_BASE}/api/tour/${id}/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    fetchPhotos();
    setUploading(false);
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const toggleSelect = (photoId) => {
    setSelected((prev) =>
      prev.includes(photoId) ? prev.filter((x) => x !== photoId) : [...prev, photoId]
    );
  };

  const toggleSelectAll = (e) => {
    setSelected(e.target.checked ? photos.map((p) => p.id) : []);
  };

  const handleEditChange = (photoId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [photoId]: { ...prev[photoId], [field]: value },
    }));
  };

  const handleSaveAll = async () => {
    for (const photo of photos) {
      const edit = edits[photo.id];
      if (!edit) continue;
      await api.put(`/tour/${id}/media/${photo.id}`, {
        title: edit.title ?? photo.title,
        mediaType: edit.mediaType !== undefined ? Number(edit.mediaType) : photo.mediaType,
      });
    }
    fetchPhotos();
    setEdits({});
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selected.length} image(s)?`)) return;
    for (const photoId of selected) {
      await api.delete(`/tour/${id}/media/${photoId}`);
    }
    setSelected([]);
    fetchPhotos();
  };

  const handleDeleteOne = async (photoId) => {
    if (!confirm('Delete this image?')) return;
    await api.delete(`/tour/${id}/media/${photoId}`);
    fetchPhotos();
  };

  return (
    <PageContainer title="Photos gallery" description="Tour Photos">
      <Typography variant="h4" mb={0.5}>Photos gallery</Typography>
      <Stack direction="row" gap={0.5} mb={3}>
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }} onClick={() => router.push('/apps/vinaday/tours')}>Tour</Typography>
        <Typography variant="body2" color="textSecondary">/ Photos Management</Typography>
      </Stack>

      <Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, pt: 2, pb: 1 }}>
          <TourTabNav tourId={id} active="Photos" />
        </Stack>
        <Divider />

        <Box sx={{ p: 3 }}>
          {/* Dropzone */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.400',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              mb: 3,
            }}
          >
            <input {...getInputProps()} />
            {uploading
              ? <><CircularProgress size={20} sx={{ mr: 1 }} />Uploading…</>
              : <Typography color="textSecondary">{isDragActive ? 'Drop files here…' : 'Drag & drop images here, or click to select'}</Typography>
            }
          </Box>

          {/* Toolbar */}
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Button variant="contained" color="error" size="small" disabled={!selected.length} onClick={handleDeleteSelected}>
              Delete Selected
            </Button>
            <Button variant="contained" color="success" size="small" onClick={handleSaveAll}>
              Save Change
            </Button>
          </Stack>

          {/* Photo table */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.length === photos.length && photos.length > 0}
                      indeterminate={selected.length > 0 && selected.length < photos.length}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {photos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No photos yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : photos.map((photo) => {
                  const edit = edits[photo.id] || {};
                  const currentTitle = edit.title !== undefined ? edit.title : (photo.title ?? '');
                  const currentType = edit.mediaType !== undefined ? String(edit.mediaType) : String(photo.mediaType ?? 2);
                  return (
                    <TableRow key={photo.id}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(photo.id)} onChange={() => toggleSelect(photo.id)} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" gap={2} alignItems="flex-start">
                          <Box sx={{ width: 200, flexShrink: 0 }}>
                            <img
                              src={`${API_BASE}${photo.originalPath}`}
                              alt={photo.title}
                              style={{ width: '100%', display: 'block' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={currentTitle}
                              onChange={(e) => handleEditChange(photo.id, 'title', e.target.value)}
                              sx={{ mb: 1 }}
                            />
                            <RadioGroup
                              row
                              value={currentType}
                              onChange={(e) => handleEditChange(photo.id, 'mediaType', e.target.value)}
                            >
                              {Object.entries(MEDIA_TYPES).map(([val, label]) => (
                                <FormControlLabel key={val} value={val} control={<Radio size="small" />} label={label} />
                              ))}
                            </RadioGroup>
                            <Button size="small" color="error" onClick={() => handleDeleteOne(photo.id)} sx={{ mt: 1 }}>
                              Delete this Image
                            </Button>
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {photos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" color="success" size="small" onClick={handleSaveAll}>
                Save Change
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </PageContainer>
  );
}
