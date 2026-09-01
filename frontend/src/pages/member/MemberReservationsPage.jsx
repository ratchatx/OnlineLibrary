import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import circulationService from '../../services/circulationService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const MemberReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRsv, setSelectedRsv] = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await circulationService.getMyReservations();
      if (res.success) {
        setReservations(res.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelConfirm = async () => {
    if (!selectedRsv) return;
    try {
      await circulationService.cancelReservation(selectedRsv.id);
      setCancelModalOpen(false);
      setSelectedRsv(null);
      fetchReservations();
    } catch {
      // Silent
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'หนังสือจอง',
      render: (rsv) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
            {rsv.book_title || 'Untitled Book'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {rsv.author || 'Academic Author'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'queue',
      label: 'สถานะคิว',
      render: (rsv) => (
        <Chip
          label={rsv.status === 'available' ? 'Ready on Hold Shelf!' : `Queue Position #${rsv.queue_position || 1}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: rsv.status === 'available' ? '#DCFCE7' : '#EDE9FE',
            color: rsv.status === 'available' ? '#15803D' : '#6D28D9',
          }}
        />
      ),
    },
    {
      id: 'reservation_date',
      label: 'วันที่ต้องการ',
      render: (rsv) => (
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
          {rsv.reservation_date ? new Date(rsv.reservation_date).toLocaleDateString('en-US') : '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'สถานะ',
      render: (rsv) => <StatusBadge status={rsv.status} />,
    },
    {
      id: 'actions',
      label: 'การดำเนินการ',
      align: 'right',
      render: (rsv) => (
        rsv.status === 'pending' || rsv.status === 'available' ? (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => { setSelectedRsv(rsv); setCancelModalOpen(true); }}
            sx={{ borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}
          >
            Cancel Hold
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
          รายการจองหนังสือของฉัน
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          ตรวจสอบลำดับคิวการจองของคุณ และดูว่าหนังสือพร้อมให้รับที่ชั้นวางหนังสือสำหรับรับคืนหรือยัง.
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        emptyTitle="No Active Reservations"
        emptyDescription="You have not placed any book on hold yet. Explore the catalog to reserve books."
      />

      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>ยกเลิกการจอง?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการระงับการจองของคุณ <strong>"{selectedRsv?.book_title}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ fontWeight: 600 }}>ยึดไว้ให้มั่น</Button>
          <Button onClick={handleCancelConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            ใช่ ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberReservationsPage;
