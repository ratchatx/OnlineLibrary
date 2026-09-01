import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AutoStories as LibraryLogoIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [mobileAnchor, setMobileAnchor] = React.useState(null);

  const handleOpenMobile = (e) => setMobileAnchor(e.currentTarget);
  const handleCloseMobile = () => setMobileAnchor(null);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin' || user.role === 'librarian') return '/staff/dashboard';
    return '/member/dashboard';
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        color: '#191C1E',
        borderBottom: '1px solid #E0E3E5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Toolbar disableGutters sx={{ minHeight: 80, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo & Subtitle */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.8,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: '#131B2E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LibraryLogoIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  lineHeight: 1.2,
                  fontFamily: '"Manrope", sans-serif',
                  color: '#191C1E',
                }}
              >
                OLMS Library
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#515F74',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  display: 'block',
                }}
              >
                ระบบจัดการห้องสมุดออนไลน์
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  fontFamily: '"Hanken Grotesk", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#515F74',
                  textTransform: 'none',
                  '&:hover': { color: '#191C1E', bgcolor: 'transparent' },
                }}
              >
                หน้าแรก (Home)
              </Button>

              <Button
                component={RouterLink}
                to="/books"
                startIcon={<BookIcon sx={{ fontSize: 18 }} />}
                sx={{
                  fontFamily: '"Hanken Grotesk", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#515F74',
                  textTransform: 'none',
                  '&:hover': { color: '#191C1E', bgcolor: 'transparent' },
                }}
              >
                ค้นหาหนังสือ (Catalog)
              </Button>

              {isAuthenticated && user ? (
                <Button
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate(getDashboardPath())}
                  sx={{
                    bgcolor: '#131B2E',
                    color: '#FFFFFF',
                    borderRadius: '24px',
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(19, 27, 46, 0.2)',
                    '&:hover': { bgcolor: '#0B1C30' },
                  }}
                >
                  เข้าสู่ Dashboard {user.role}
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  startIcon={<LoginIcon />}
                  sx={{
                    bgcolor: '#131B2E',
                    color: '#FFFFFF',
                    borderRadius: '24px',
                    px: 3,
                    py: 1.1,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(19, 27, 46, 0.2)',
                    '&:hover': { bgcolor: '#0B1C30' },
                  }}
                >
                  เข้าสู่ระบบ (Sign In)
                </Button>
              )}
            </Box>
          )}

          {/* Mobile Navigation Trigger */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleOpenMobile} color="inherit">
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileAnchor}
                open={Boolean(mobileAnchor)}
                onClose={handleCloseMobile}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    mt: 1,
                    minWidth: 180,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <MenuItem component={RouterLink} to="/" onClick={handleCloseMobile}>
                  หน้าแรก (Home)
                </MenuItem>
                <MenuItem component={RouterLink} to="/books" onClick={handleCloseMobile}>
                  ค้นหาหนังสือ (Catalog)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMobile();
                    navigate(getDashboardPath());
                  }}
                >
                  {isAuthenticated && user ? `Dashboard (${user.role})` : 'เข้าสู่ระบบ (Sign In)'}
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
