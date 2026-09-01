import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import Footer from '../components/common/Footer';

const StaffLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{"role":"librarian"}');
  const role = user.role === 'admin' ? 'admin' : 'librarian';

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Staff / Admin Sidebar */}
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        desktopOpen={desktopOpen}
      />

      {/* Main Content Column */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Topbar
          onToggleSidebar={handleToggleSidebar}
          title={role === 'admin' ? 'ระบบผู้ดูแลระบบ (Admin Console)' : 'ระบบงานเจ้าหน้าที่ (Staff Portal)'}
        />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default StaffLayout;
