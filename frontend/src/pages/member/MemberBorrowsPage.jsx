import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  CheckCircle as ReturnedIcon,
} from '@mui/icons-material';
import circulationService from '../../services/circulationService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const MemberBorrowsPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await circulationService.getMyBorrowings({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (res.success) {
        setLoans(res.data || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const columns = [
    {
      id: 'title',
      label: 'ชื่อหนังสือ',
      render: (loan) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
            {loan.book_title || 'Untitled Book'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {loan.author || 'Author'} • Loan Code: {loan.borrowing_code || `#${loan.id}`}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'borrow_date',
      label: 'ยืมเมื่อ',
      render: (loan) => (
        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
          {loan.borrow_date ? new Date(loan.borrow_date).toLocaleDateString('en-US') : '-'}
        </Typography>
      ),
    },
    {
      id: 'due_date',
      label: 'วันครบกำหนด',
      render: (loan) => {
        const dueDate = new Date(loan.due_date);
        const isOverdue = dueDate < new Date() && loan.status !== 'returned';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ClockIcon sx={{ fontSize: 16, color: isOverdue ? '#DC2626' : '#64748B' }} />
            <Typography variant="body2" sx={{ fontWeight: isOverdue ? 700 : 500, color: isOverdue ? '#DC2626' : '#1E293B', fontSize: '0.85rem' }}>
              {dueDate.toLocaleDateString('en-US')}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'สถานะสินเชื่อ',
      render: (loan) => <StatusBadge status={loan.status} />,
    },
  ];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
          หนังสือที่ยืมและประวัติการยืม
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          ตรวจสอบรายการที่ยืมอยู่ ติดตามกำหนดส่งคืน และดูประวัติการคืน.
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={loans}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ทั้งหมด', 'ยืมมา', 'เกินกำหนด', 'ส่งคืนแล้ว'].map((st) => (
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
    </Box>
  );
};

export default MemberBorrowsPage;
