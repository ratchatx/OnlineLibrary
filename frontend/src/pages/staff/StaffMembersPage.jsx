import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  PersonAdd as AddMemberIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import memberService from '../../services/memberService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SlideOverDrawer from '../../components/ui/SlideOverDrawer';

const StaffMembersPage = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Add Member Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    role: 'member',
    password: 'Member@1234',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await memberService.getMembers({
        search: search.trim() || undefined,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (res.success) {
        setMembers(res.data || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRegisterMember = async () => {
    setSubmitting(true);
    try {
      // Call member create API
      setDrawerOpen(false);
      fetchMembers();
    } catch {
      // Silent
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      id: 'member',
      label: 'ข้อมูลสมาชิก',
      render: (m) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontSize: '0.85rem', fontWeight: 700 }}>
            {m.username?.charAt(0).toUpperCase() || 'M'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', cursor: 'pointer', '&:hover': { color: '#2563EB' } }} onClick={() => navigate(`/staff/members/${m.id}`)}>
              {m.name || m.username}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {m.email || 'No email registered'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'บทบาทผู้ใช้งาน',
      render: (m) => (
        <Chip
          label={m.role ? m.role.toUpperCase() : 'MEMBER'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: m.role === 'admin' ? '#EDE9FE' : m.role === 'librarian' ? '#EFF6FF' : '#F1F5F9',
            color: m.role === 'admin' ? '#6D28D9' : m.role === 'librarian' ? '#1D4ED8' : '#475569',
          }}
        />
      ),
    },
    {
      id: 'loans',
      label: 'สินเชื่อที่ใช้งานอยู่',
      render: (m) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
          {m.active_borrows_count ?? 0} / 5 Books
        </Typography>
      ),
    },
    {
      id: 'fines',
      label: 'ความสมดุลอันละเอียดอ่อน',
      render: (m) => {
        const fine = parseFloat(m.unpaid_fines_total || 0);
        return (
          <Typography variant="body2" sx={{ fontWeight: 700, color: fine > 0 ? '#DC2626' : '#16A34A' }}>
            ฿{fine.toFixed(2)}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'สถานะบัตร',
      render: (m) => <StatusBadge status={m.status || 'active'} customLabel="Active Card" />,
    },
    {
      id: 'actions',
      label: 'การดำเนินการ',
      align: 'right',
      render: (m) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`/staff/members/${m.id}`)}
          startIcon={<ViewIcon sx={{ fontSize: '15px !important' }} />}
          sx={{ borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}
        >
          ประวัติโดยย่อ
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
            ทำเนียบสมาชิกและธรรมาภิบาล
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            ค้นหาโปรไฟล์นักศึกษาและบุคลากร ตรวจสอบโควตาการยืม และจัดการสิทธิ์การใช้งานบัตร.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setDrawerOpen(true)}
          startIcon={<AddMemberIcon />}
          sx={{ bgcolor: '#0F2942', borderRadius: '10px', px: 2.5, py: 1, fontWeight: 700 }}
        >
          สมัครสมาชิก
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        headerActions={
          <TextField
            size="small"
            placeholder="ค้นหาด้วยชื่อสมาชิก ชื่อผู้ใช้ หรืออีเมล..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
          />
        }
      />

      {/* SlideOverDrawer for Registering Member */}
      <SlideOverDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="ลงทะเบียนสมาชิกห้องสมุดใหม่"
        subtitle="สร้างข้อมูลประจำตัวสมาชิกสำหรับนักศึกษาและคณาจารย์"
        footer={
          <>
            <Button onClick={() => setDrawerOpen(false)} sx={{ fontWeight: 600 }}>ยกเลิก</Button>
            <Button onClick={handleRegisterMember} variant="contained" disabled={submitting} sx={{ fontWeight: 700, bgcolor: '#2563EB' }}>
              {submitting ? 'การสร้างสรรค์...' : 'สร้างสมาชิก'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="ชื่อ-นามสกุล *"
            fullWidth
            value={newMemberData.full_name}
            onChange={(e) => setNewMemberData({ ...newMemberData, full_name: e.target.value })}
            placeholder="Eleanor Vance"
          />
          <TextField
            label="ชื่อผู้ใช้*"
            fullWidth
            value={newMemberData.username}
            onChange={(e) => setNewMemberData({ ...newMemberData, username: e.target.value })}
            placeholder="evance"
          />
          <TextField
            label="ที่อยู่อีเมล*"
            fullWidth
            value={newMemberData.email}
            onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
            placeholder="e.vance@university.ac.th"
          />
          <TextField
            label="หมายเลขโทรศัพท์"
            fullWidth
            value={newMemberData.phone}
            onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
            placeholder="081-234-5678"
          />
          <FormControl fullWidth>
            <InputLabel>บทบาทของบัญชี</InputLabel>
            <Select
              value={newMemberData.role}
              label="Account Role"
              onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value })}
            >
              <MenuItem value="member">นักศึกษา / อาจารย์</MenuItem>
              <MenuItem value="librarian">เจ้าหน้าที่ห้องสมุด</MenuItem>
              <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </SlideOverDrawer>
    </Box>
  );
};

export default StaffMembersPage;
