import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  BookmarkBorder as ReserveIcon,
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import circulationService from '../../services/circulationService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const StaffReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRsv, setSelectedRsv] = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await circulationService.getReservations({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (res.success) {
        setReservations(res.data || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelConfirm = async () => {
    if (!selectedRsv) return;
    try {
      await circulationService.cancelReservation(selectedRsv.id);
      setCancelDialogOpen(false);
      setSelectedRsv(null);
      fetchReservations();
    } catch {
      // Silent
    }
  };

  const columns = [
    {
      id: 'book',
      label: 'Book Title',
      render: (rsv) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
            {rsv.book_title || 'Untitled Book'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {rsv.author || 'Author'} • Shelf: {rsv.shelf_location || 'Floor 2, Stacks B'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'member',
      label: 'Member Name',
      render: (rsv) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {rsv.member_name || rsv.username || 'Member User'}
        </Typography>
      ),
    },
    {
      id: 'queue',
      label: 'Queue Priority',
      render: (rsv) => (
        <Chip
          label={rsv.queue_position ? `Queue #${rsv.queue_position}` : 'Priority #1'}
          size="small"
          sx={{ fontWeight: 700, bgcolor: '#EDE9FE', color: '#6D28D9', fontSize: '0.72rem' }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (rsv) => <StatusBadge status={rsv.status} />,
    },
    {
      id: 'created_at',
      label: 'Reservation Date',
      render: (rsv) => (
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem' }}>
          {rsv.reservation_date ? new Date(rsv.reservation_date).toLocaleDateString('en-US') : '-'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (rsv) => (
        rsv.status === 'pending' || rsv.status === 'available' ? (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => { setSelectedRsv(rsv); setCancelDialogOpen(true); }}
            sx={{ borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem' }}
          >
            Cancel Hold
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
          Reservation Queue & Hold Shelf
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Track reservation priorities, manage hold shelf allocations, and monitor pickup deadlines.
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['all', 'pending', 'available', 'completed', 'cancelled'].map((st) => (
              <Chip
                key={st}
                label={st.toUpperCase()}
                clickable
                onClick={() => { setStatusFilter(st); setPage(0); }}
                sx={{
                  fontWeight: 700,
                  bgcolor: statusFilter === st ? '#0F2942' : '#F1F5F9',
                  color: statusFilter === st ? '#FFFFFF' : '#475569',
                }}
              />
            ))}
          </Box>
        }
      />

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>Cancel Reservation Hold?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Are you sure you want to cancel the hold for <strong>"{selectedRsv?.book_title}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleCancelConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffReservationsPage;
