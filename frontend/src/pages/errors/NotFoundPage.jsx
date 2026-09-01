import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home as HomeIcon, ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'error.light',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <ErrorIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          ไม่พบหน้าที่คุณต้องการ (Page Not Found)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          ขออภัย หน้าที่คุณพยายามเข้าถึงไม่มีอยู่ในระบบ หรืออาจถูกย้ายตำแหน่งไปแล้ว
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          size="large"
        >
          กลับสู่หน้าหลัก (Back to Home)
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
