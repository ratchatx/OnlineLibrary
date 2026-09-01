import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  AutoStories as BookIcon,
  BookmarkBorder as ReserveIcon,
  MonetizationOnOutlined as FineIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  AccessTime as ClockIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/dashboardService';
import circulationService from '../../services/circulationService';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';

const MemberDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, borrowsRes] = await Promise.allSettled([
        dashboardService.getMemberSummary(),
        circulationService.getMyBorrowings({ limit: 4 }),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
      if (borrowsRes.status === 'fulfilled' && borrowsRes.value?.success) {
        setActiveLoans(borrowsRes.value.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeBorrows = summary?.active_borrows ?? 0;
  const overdueCount = summary?.overdue_count ?? 0;
  const pendingReservations = summary?.pending_reservations ?? 0;
  const unpaidFines = parseFloat(summary?.total_unpaid_fines || 0);

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 5 }}>
      {/* ── 1. Hero Member Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0F2942 0%, #1E3A5F 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', px: 1.5, py: 0.4, borderRadius: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
            พอร์ทัลสำหรับนักศึกษา
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', mt: 1, mb: 0.5 }}>
           สวัสดี, {user?.name || user?.username || 'Member'}! 📚
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 550 }}>
            คุณมี <strong>{activeBorrows} รายการยืมหนังสือที่ยังไม่ครบกำหนดคืน</strong> และ <strong>{pendingReservations} การจองที่มีผลอยู่</strong>.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate('/books')}
          startIcon={<SearchIcon />}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            borderRadius: '24px',
            px: 3,
            py: 1.1,
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          สำรวจแคตตาล็อก
        </Button>
      </Paper>

      {/* Overdue Alert Banner if any */}
      {overdueCount > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 3.5, borderRadius: '12px', fontWeight: 600 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/member/my-borrows')}>
              View Overdue
            </Button>
          }
        >
          🚨 You have {overdueCount} book(s) that are past their due date. Please return them to avoid additional fines.
        </Alert>
      )}

      {/* ── 2. Member Statistics Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="กำลังยืมอยู่"
            value={activeBorrows}
            unit="หนังสือ"
            subtext="โควตา: สูงสุด 5 เล่ม"
            icon={<BookIcon sx={{ fontSize: 20 }} />}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            loading={loading}
            onClick={() => navigate('/member/my-borrows')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="การจองที่มีผลอยู่"
            value={pendingReservations}
            unit="ถือ"
            subtext="ตู้เก็บของแบบมีช่องล็อก"
            icon={<ReserveIcon sx={{ fontSize: 20 }} />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            loading={loading}
            onClick={() => navigate('/member/my-reservations')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ค่าปรับค้างชำระ"
            value={`฿${unpaidFines.toFixed(2)}`}
            subtext={unpaidFines > 0 ? 'ชำระเงินออนไลน์หรือที่เคาน์เตอร์' : 'ไม่มีค่าปรับค้างชำระ'}
            isUrgent={unpaidFines > 0}
            icon={<FineIcon sx={{ fontSize: 20 }} />}
            iconBg={unpaidFines > 0 ? '#FEE2E2' : '#DCFCE7'}
            iconColor={unpaidFines > 0 ? '#DC2626' : '#16A34A'}
            loading={loading}
            onClick={() => navigate('/member/my-fines')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ประวัติการอ่าน"
            value={summary?.total_borrowed_history ?? 18}
            unit="หนังสือ"
            subtext="การกู้ยืมตลอดชีพ"
            icon={<HistoryIcon sx={{ fontSize: 20 }} />}
            iconBg="#EDE9FE"
            iconColor="#7C3AED"
            loading={loading}
            onClick={() => navigate('/member/profile')}
          />
        </Grid>
      </Grid>

      {/* ── 3. Active Loans Section ── */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A' }}>
              สินเชื่อที่ใช้งานอยู่ของฉัน
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              หนังสือที่คุณถือครองอยู่และกำหนดวันคืน
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowIcon fontSize="small" />}
            onClick={() => navigate('/member/my-borrows')}
            sx={{ fontWeight: 700, color: '#2563EB' }}
          >
            จัดการสินเชื่อทั้งหมด
          </Button>
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '12px' }} />
        ) : activeLoans.length > 0 ? (
          <Grid container spacing={2}>
            {activeLoans.map((loan) => {
              const dueDate = new Date(loan.due_date);
              const isOverdue = dueDate < new Date() && loan.status !== 'returned';

              return (
                <Grid item xs={12} sm={6} key={loan.id}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      border: `1px solid ${isOverdue ? '#FECACA' : '#E2E8F0'}`,
                      bgcolor: isOverdue ? '#FEF2F2' : '#F8FAFC',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.3 }}>
                        {loan.book_title || 'Untitled Book'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isOverdue ? '#DC2626' : '#64748B' }}>
                        <ClockIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          เนื่องจาก: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>

                    <StatusBadge status={isOverdue ? 'overdue' : loan.status || 'borrowed'} />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px' }}>
            <Typography variant="body2" color="text.secondary">
              You do not have any active book checkouts right now.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/books')}
              sx={{ mt: 1.5, borderRadius: '8px', fontWeight: 700 }}
            >
              Browse Library Catalog
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MemberDashboardPage;
