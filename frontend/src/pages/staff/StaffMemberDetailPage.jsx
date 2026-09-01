import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Divider,
  Skeleton,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  MenuBook as BorrowIcon,
  BookmarkBorder as ReserveIcon,
  MonetizationOnOutlined as FineIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import memberService from '../../services/memberService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';

const StaffMemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Tab Data States
  const [activeLoans, setActiveLoans] = useState([]);
  const [historyLoans, setHistoryLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);

  const fetchMemberData = useCallback(async () => {
    setLoading(true);
    try {
      const [memRes, borrowsRes, rsvRes, finesRes] = await Promise.allSettled([
        memberService.getMemberById(id),
        memberService.getMemberBorrowings(id),
        memberService.getMemberReservations(id),
        memberService.getMemberFines(id),
      ]);

      if (memRes.status === 'fulfilled' && memRes.value?.success) {
        setMember(memRes.value.data);
      }
      if (borrowsRes.status === 'fulfilled' && borrowsRes.value?.success) {
        const allBorrows = borrowsRes.value.data || [];
        setActiveLoans(allBorrows.filter((b) => b.status === 'borrowed' || b.status === 'overdue'));
        setHistoryLoans(allBorrows);
      }
      if (rsvRes.status === 'fulfilled' && rsvRes.value?.success) {
        setReservations(rsvRes.value.data || []);
      }
      if (finesRes.status === 'fulfilled' && finesRes.value?.success) {
        setFines(finesRes.value.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  const activeCount = activeLoans.length;
  const overdueCount = activeLoans.filter((b) => new Date(b.due_date) < new Date()).length;
  const unpaidFineTotal = fines
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const loanColumns = [
    {
      id: 'title',
      label: 'Book Title',
      render: (b) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
          {b.book_title || 'Untitled Book'}
        </Typography>
      ),
    },
    {
      id: 'borrow_date',
      label: 'Borrow Date',
      render: (b) => (
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          {b.borrow_date ? new Date(b.borrow_date).toLocaleDateString('en-US') : '-'}
        </Typography>
      ),
    },
    {
      id: 'due_date',
      label: 'Due Date',
      render: (b) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: new Date(b.due_date) < new Date() ? '#DC2626' : '#1E293B' }}>
          {b.due_date ? new Date(b.due_date).toLocaleDateString('en-US') : '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (b) => <StatusBadge status={b.status} />,
    },
  ];

  const reservationColumns = [
    {
      id: 'book',
      label: 'Book Title',
      render: (r) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
          {r.book_title || 'Untitled Book'}
        </Typography>
      ),
    },
    {
      id: 'queue',
      label: 'Queue Priority',
      render: (r) => (
        <Chip label={`Queue #${r.queue_position || 1}`} size="small" sx={{ fontWeight: 700, bgcolor: '#EDE9FE', color: '#6D28D9' }} />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const fineColumns = [
    {
      id: 'id',
      label: 'Fine Reference',
      render: (f) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          FN-{f.id}
        </Typography>
      ),
    },
    {
      id: 'book',
      label: 'Overdue Book',
      render: (f) => (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          {f.book_title || 'Overdue Item'}
        </Typography>
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      render: (f) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: f.status === 'unpaid' ? '#DC2626' : '#0F172A' }}>
          ฿{parseFloat(f.amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (f) => <StatusBadge status={f.status} />,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ maxWidth: '1300px', mx: 'auto', p: 4 }}>
        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1300px', mx: 'auto', pb: 6 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/staff/members')} sx={{ fontWeight: 700, color: '#475569' }}>
          Back to Members Directory
        </Button>
      </Box>

      {/* Member 360° Profile Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 68, height: 68, bgcolor: '#2563EB', fontSize: '1.6rem', fontWeight: 800 }}>
            {member?.username?.charAt(0).toUpperCase() || 'M'}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A' }}>
                {member?.name || member?.username}
              </Typography>
              <StatusBadge status="active" customLabel="Active Card" />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Member ID: <strong>#{member?.id}</strong> • Role: <strong style={{ textTransform: 'capitalize' }}>{member?.role}</strong> • Email: {member?.email || 'None'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/staff/borrowings')}
            sx={{ bgcolor: '#2563EB', borderRadius: '8px', fontWeight: 700 }}
          >
            Issue New Loan
          </Button>
        </Box>
      </Paper>

      {/* Member Statistics Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Checkouts"
            value={`${activeCount} / 5`}
            unit="books"
            icon={<BorrowIcon sx={{ fontSize: 20 }} />}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Items"
            value={overdueCount}
            unit="books"
            isUrgent={overdueCount > 0}
            icon={<BorrowIcon sx={{ fontSize: 20 }} />}
            iconBg={overdueCount > 0 ? '#FEE2E2' : '#DCFCE7'}
            iconColor={overdueCount > 0 ? '#DC2626' : '#16A34A'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Reservations"
            value={reservations.length}
            unit="holds"
            icon={<ReserveIcon sx={{ fontSize: 20 }} />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unpaid Fines"
            value={`฿${unpaidFineTotal.toFixed(2)}`}
            isUrgent={unpaidFineTotal > 0}
            icon={<FineIcon sx={{ fontSize: 20 }} />}
            iconBg={unpaidFineTotal > 0 ? '#FEE2E2' : '#DCFCE7'}
            iconColor={unpaidFineTotal > 0 ? '#DC2626' : '#16A34A'}
          />
        </Grid>
      </Grid>

      {/* Tabs for Member Detailed Activity */}
      <Paper elevation={0} sx={{ p: 1, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              px: 2.5,
            },
          }}
        >
          <Tab label={`Active Loans (${activeLoans.length})`} />
          <Tab label={`Full Loan History (${historyLoans.length})`} />
          <Tab label={`Reservations (${reservations.length})`} />
          <Tab label={`Fine Records (${fines.length})`} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <DataTable
          columns={loanColumns}
          data={activeLoans}
          emptyTitle="No Active Loans"
          emptyDescription="This member has returned all borrowed library items."
        />
      )}
      {activeTab === 1 && (
        <DataTable
          columns={loanColumns}
          data={historyLoans}
          emptyTitle="No Loan History"
        />
      )}
      {activeTab === 2 && (
        <DataTable
          columns={reservationColumns}
          data={reservations}
          emptyTitle="No Active Holds"
        />
      )}
      {activeTab === 3 && (
        <DataTable
          columns={fineColumns}
          data={fines}
          emptyTitle="No Fine Records"
        />
      )}
    </Box>
  );
};

export default StaffMemberDetailPage;
