import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Button,
  Divider,
} from '@mui/material';
import {
  Person as ProfileIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import memberService from '../../services/memberService';
import ChangePasswordDialog from '../../components/auth/ChangePasswordDialog';
import StatusBadge from '../../components/ui/StatusBadge';

const MemberProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await memberService.getMyProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Profile Header Card ── */}
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
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: '#2563EB',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A' }}>
                {profile?.name || user?.name || user?.username}
              </Typography>
              <StatusBadge status="active" customLabel="Active Card" />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              รหัสนักศึกษา / รหัสผู้วิจัย: <strong>#{user?.id || 'M-00482'}</strong> • บทบาท: <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<LockResetIcon />}
          onClick={() => setPasswordModalOpen(true)}
          sx={{ borderRadius: '10px', fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}
        >
          เปลี่ยนรหัสผ่าน
        </Button>
      </Paper>

      {/* ── 2. Account Details Grid ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 2.5 }}>
              ข้อมูลการติดต่อและสังกัด
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon sx={{ color: '#64748B' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">ที่อยู่อีเมล</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{profile?.email || user?.email || 'student@university.ac.th'}</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneIcon sx={{ color: '#64748B' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">หมายเลขโทรศัพท์</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{profile?.phone || '081-234-5678'}</Typography>
                </Box>
              </Box>
              <Divider /> 
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SchoolIcon sx={{ color: '#64748B' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">คณะ / ภาควิชา</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>คณะศิลปศาสตร์และวิทยาศาสตร์</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 2.5 }}>
              กฎและโควตาการยืมคืน
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">จำนวนการยืมพร้อมกันสูงสุด:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB' }}>หนังสือ 5 เล่ม</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">ระยะเวลาการยืมปกติ:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>14 วันต่อเล่ม</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">อัตราค่าปรับกรณีคืนหนังสือล่าช้า:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>฿5.00 / วัน / เล่ม</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">ช่วงเวลารับสินค้าที่ชั้นวางพักสินค้า:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>48 ชั่วโมง</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <ChangePasswordDialog open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </Box>
  );
};

export default MemberProfilePage;
