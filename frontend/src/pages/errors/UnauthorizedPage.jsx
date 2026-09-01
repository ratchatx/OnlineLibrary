import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { LockOutlined as LockIcon, Home as HomeIcon, Login as LoginIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'warning.light',
            color: 'warning.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <LockIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          403
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          ไม่มีสิทธิ์เข้าถึง (Access Denied)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          คุณไม่มีสิทธิ์ระดับผู้ใช้งาน (RBAC Permission) เพียงพอสำหรับการเข้าถึงหน้านี้ หากจำเป็นต้องใช้งาน กรุณาติดต่อผู้ดูแลระบบ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            startIcon={<HomeIcon />}
            size="large"
          >
            หน้าหลัก
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            size="large"
          >
            เข้าสู่ระบบด้วยบัญชีอื่น
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UnauthorizedPage;
