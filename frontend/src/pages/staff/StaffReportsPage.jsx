import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import dashboardService from '../../services/dashboardService';

const StaffReportsPage = () => {
  const [reportType, setReportType] = useState('circulation'); // 'circulation' | 'fines' | 'popular'
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      if (reportType === 'circulation') {
        const res = await dashboardService.getBorrowReturnReport({ range: dateRange });
        if (res.success) setReportData(res.data || []);
      } else if (reportType === 'fines') {
        const res = await dashboardService.getOverdueFinesReport({ range: dateRange });
        if (res.success) setReportData(res.data || []);
      } else {
        const res = await dashboardService.getPopularBooksReport({ limit: 10 });
        if (res.success) setReportData(res.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Export CSV with UTF-8 BOM for Excel
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = Object.keys(reportData[0]);
    const csvRows = [
      headers.join(','),
      ...reportData.map((row) => headers.map((h) => `"${row[h] ?? ''}"`).join(',')),
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `library_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Page Header & Export Center ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
            ศูนย์กลางข้อมูลวิเคราะห์และข้อมูลเชิงลึกสำหรับผู้บริหาร
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
จัดทำรายงานการหมุนเวียนของสถาบัน รายงานสรุปทางการเงิน และดัชนีความเร็วในการหมุนเวียนสินค้าคงคลัง.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<PrintIcon />}
            sx={{ borderRadius: '8px', fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}
          >
            พิมพ์รายงาน
          </Button>

          <Button
            variant="contained"
            onClick={handleExportCSV}
            startIcon={<ExportIcon />}
            sx={{ bgcolor: '#16A34A', borderRadius: '8px', fontWeight: 700, '&:hover': { bgcolor: '#15803D' } }}
          >
            ส่งออกเป็น Excel
          </Button>
        </Box>
      </Box>

      {/* ── 2. Filter & Report Selector Bar ── */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Tabs
            value={reportType}
            onChange={(_, val) => setReportType(val)}
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
            <Tab value="circulation" label="ความเร็วในการหมุนเวียน" />
            <Tab value="fines" label="การตรวจสอบค่าปรับและบทลงโทษ" />
            <Tab value="popular" label="หนังสือยอดนิยมที่มีความต้องการสูง" />
          </Tabs>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>กรอบเวลา</InputLabel>
            <Select
              value={dateRange}
              label="Date Horizon"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7days">7 วันที่ผ่านมา</MenuItem>
              <MenuItem value="30days">30 วันที่ผ่านมา</MenuItem>
              <MenuItem value="90days">ไตรมาสที่ผ่านมา (90 วัน)</MenuItem>
              <MenuItem value="year">ปีการศึกษา</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* ── 3. Report Data Table ── */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <Box sx={{ px: 3.5, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A' }}>
            {reportType === 'circulation'
              ? 'สรุปความเร็วการไหลเวียน'
              : reportType === 'fines'
              ? 'ยอดค่าปรับและยอดค้างชำระ'
              : 'สิ่งพิมพ์ทางวิชาการที่ได้รับความนิยมสูงสุด'}
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                {reportData.length > 0 &&
                  Object.keys(reportData[0]).map((key) => (
                    <TableCell key={key} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {key.replace(/_/g, ' ')}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} sx={{ py: 2 }}>
                      <Skeleton variant="text" height={24} />
                    </TableCell>
                  </TableRow>
                ))
              ) : reportData.length > 0 ? (
                reportData.map((row, rIdx) => (
                  <TableRow key={rIdx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {Object.values(row).map((val, cIdx) => (
                      <TableCell key={cIdx} sx={{ color: '#1E293B', fontSize: '0.85rem', fontWeight: cIdx === 0 ? 700 : 500 }}>
                        {String(val ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                    ไม่มีข้อมูลรายงานสำหรับชั้นดินที่เลือกนี้.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StaffReportsPage;
