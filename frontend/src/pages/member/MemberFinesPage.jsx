import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import fineService from '../../services/fineService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const MemberFinesPage = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fineService.getMyFines();
      if (res.success) {
        setFines(res.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  const totalUnpaid = fines
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const columns = [
    {
      id: 'id',
      label: 'ข้อมูลอ้างอิงที่ยอดเยี่ยม',
      render: (f) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>
          FN-{f.id}
        </Typography>
      ),
    },
    {
      id: 'book',
      label: 'หนังือเกินกำหนดส่งคืน',
      render: (f) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {f.book_title || 'Overdue Book'}
        </Typography>
      ),
    },
    {
      id: 'amount',
      label: 'จำนวน',
      render: (f) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: f.status === 'unpaid' ? '#DC2626' : '#0F172A' }}>
          ฿{parseFloat(f.amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'สถานะการชำระเงิน',
      render: (f) => <StatusBadge status={f.status} />,
    },
  ];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
          บันทึกค่าปรับและค่าธรรมเนียมที่ค้างชำระของฉัน
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          ตรวจสอบการประเมินค่าธรรมเนียม ตรวจสอบสถานะการชำระเงิน และดูข้อมูลอ้างอิงใบเสร็จรับเงิน.
        </Typography>
      </Box>

      {totalUnpaid > 0 ? (
        <Alert severity="warning" sx={{ mb: 3.5, borderRadius: '12px', fontWeight: 600 }}>
          💵 คุณมียอดค้างชำระอยู่ <strong>฿{totalUnpaid.toFixed(2)}</strong>. กรุณาติดต่อเคาน์เตอร์ชำระเงินเพื่อดำเนินการชำระค่าใช้จ่าย.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3.5, borderRadius: '12px', fontWeight: 600 }}>
          🎉 บัญชีห้องสมุดของคุณอยู่ในสถานะปกติ และไม่มีค่าปรับค้างชำระ.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={fines}
        loading={loading}
        emptyTitle="ไม่มีประวัติการถูกปรับ"
        emptyDescription="คุณไม่เคยมีค่าปรับห้องสมุด."
      />
    </Box>
  );
};

export default MemberFinesPage;
