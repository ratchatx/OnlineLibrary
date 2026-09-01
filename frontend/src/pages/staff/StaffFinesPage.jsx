import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  MonetizationOn as FineIcon,
  CheckCircle as PaidIcon,
  FormatQuote as WaiveIcon,
  PeopleAlt as MemberIcon,
} from '@mui/icons-material';
import fineService from '../../services/fineService';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';

const StaffFinesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Settlement Modal State
  const [selectedFine, setSelectedFine] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [waiveReason, setWaiveReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchFines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fineService.getFines({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (res.success) {
        setFines(res.data || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Payment Settlement Handler
  const handlePayConfirm = async () => {
    if (!selectedFine) return;
    setActionSubmitting(true);
    setActionError('');
    try {
      await fineService.payFine(selectedFine.id);
      setPayModalOpen(false);
      setSelectedFine(null);
      fetchFines();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to process payment.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Waive Settlement Handler
  const handleWaiveConfirm = async () => {
    if (!selectedFine || !waiveReason.trim()) {
      setActionError('A valid justification reason is required to waive a library fine.');
      return;
    }
    setActionSubmitting(true);
    setActionError('');
    try {
      await fineService.waiveFine(selectedFine.id, { waive_reason: waiveReason.trim() });
      setWaiveModalOpen(false);
      setSelectedFine(null);
      setWaiveReason('');
      fetchFines();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to waive fine.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const columns = [
    {
      id: 'id',
      label: 'รหัสค่าปรับ',
      render: (f) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>
          FN-{f.id}
        </Typography>
      ),
    },
    {
      id: 'member',
      label: 'รหัสสมาชิก',
      render: (f) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {f.member_name || f.username || 'Student Member'}
        </Typography>
      ),
    },
    {
      id: 'book',
      label: 'หนังสือที่เชื่อมโยงกัน',
      render: (f) => (
        <Typography variant="body2" sx={{ color: '#475569', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {f.book_title || 'Overdue Book'}
        </Typography>
      ),
    },
    {
      id: 'amount',
      label: 'จำนวนเงินค่าปรับ',
      render: (f) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: f.status === 'unpaid' ? '#DC2626' : '#0F172A' }}>
          ฿{parseFloat(f.amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'สถานะ',
      render: (f) => <StatusBadge status={f.status} />,
    },
    {
      id: 'actions',
      label: 'การดำเนินการเพื่อยุติข้อพิพาท',
      align: 'right',
      render: (f) => (
        f.status === 'unpaid' ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => { setSelectedFine(f); setPayModalOpen(true); }}
              sx={{ bgcolor: '#16A34A', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}
            >
              Collect
            </Button>
            {isAdmin && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => { setSelectedFine(f); setWaiveModalOpen(true); }}
                sx={{ borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}
              >
                Waive
              </Button>
            )}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>Settled</Typography>
        )
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Page Header ── */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
          จุดชำระค่าปรับและจัดการภาระทางการเงิน
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          จัดการค่าปรับกรณีล่าช้า รับชำระเงินทั้งในรูปแบบเงินสดและดิจิทัล และดำเนินการเรื่องการยกเว้นค่าธรรมเนียมหรือค่าปรับตามระเบียบ.
        </Typography>
      </Box>

      {/* ── 2. Financial KPI Metric Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ยอดคงค้างรวม"
            value="฿2,350"
            trend="จำเป็นต้องดำเนินการ"
            trendType="danger"
            isUrgent={true}
            icon={<FineIcon sx={{ fontSize: 20 }} />}
            iconBg="#FEE2E2"
            iconColor="#DC2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ยอดที่รวบรวมได้ในเดือนนี้"
            value="฿14,820"
            trend="+12.4% เมื่อเทียบกับเดือนก่อนหน้า"
            trendType="up"
            icon={<PaidIcon sx={{ fontSize: 20 }} />}
            iconBg="#DCFCE7"
            iconColor="#16A34A"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ยกเว้นค่าปรับ"
            value="฿450"
            trend="ได้รับอนุญาตจากผู้ดูแลระบบ"
            trendType="flat"
            icon={<WaiveIcon sx={{ fontSize: 20 }} />}
            iconBg="#EDE9FE"
            iconColor="#7C3AED"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="สมาชิกที่เป็นลูกหนี้"
            value="18"
            unit="ผู้ใช้งาน"
            trend="บัญชีที่ถูกจำกัดการใช้งาน"
            trendType="danger"
            icon={<MemberIcon sx={{ fontSize: 20 }} />}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
          />
        </Grid>
      </Grid>

      {/* ── 3. Fines DataTable ── */}
      <DataTable
        columns={columns}
        data={fines}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ทั้งหมด', 'ค้างชำระ', 'จ่าย', 'สละสิทธิ์'].map((st) => (
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

      {/* ── 4. Collect Payment Dialog ── */}
      <Dialog
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, maxWidth: 440 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif' }}>
          รับชำระค่าปรับ
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            ยืนยันการรับชำระค่าปรับ <strong>#FN-{selectedFine?.id}</strong> from <strong>{selectedFine?.member_name || selectedFine?.username}</strong>.
          </Typography>
          <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', textAlign: 'center', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>ยอดรวมที่ต้องเรียกเก็บ:</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534', fontFamily: '"Manrope", sans-serif' }}>
              ฿{parseFloat(selectedFine?.amount || 0).toFixed(2)}
            </Typography>
          </Box>
          {actionError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{actionError}</Alert>}
        </DialogContent>  
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPayModalOpen(false)} sx={{ fontWeight: 600 }}>ยกเลิก</Button>
          <Button onClick={handlePayConfirm} variant="contained" disabled={actionSubmitting} sx={{ fontWeight: 700, bgcolor: '#16A34A' }}>
            {actionSubmitting ? 'Processing...' : 'Confirm Cash / Card Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 5. Admin Waive Dialog ── */}
      <Dialog
        open={waiveModalOpen}
        onClose={() => setWaiveModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, maxWidth: 460 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#6D28D9' }}>
          การอนุมัติยกเว้นค่าปรับทางปกครอง
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            โปรดระบุเหตุผลทางปกครองอย่างเป็นทางการเพื่อยกเว้นข้อกำหนดดังกล่าว <strong>฿{parseFloat(selectedFine?.amount || 0).toFixed(2)}</strong> for {selectedFine?.member_name || selectedFine?.username}.
          </Typography>
          <TextField
            label="Mandatory Waive Justification *"
            multiline
            rows={3}
            fullWidth
            value={waiveReason}
            onChange={(e) => setWaiveReason(e.target.value)}
            placeholder="e.g. Medical emergency documentation verified by Dean's Office..."
            sx={{ mb: 2 }}
          />
          {actionError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{actionError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWaiveModalOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleWaiveConfirm} variant="contained" color="secondary" disabled={actionSubmitting} sx={{ fontWeight: 700 }}>
            {actionSubmitting ? 'Recording...' : 'Authorize Waiver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffFinesPage;
