import React, { useState } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import Footer from '../components/common/Footer';

const MemberLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Member Sidebar */}
      <Sidebar
        role="member"
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
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Topbar onToggleSidebar={handleToggleSidebar} title="ระบบบริการสมาชิก (Member Portal)" />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default MemberLayout;
