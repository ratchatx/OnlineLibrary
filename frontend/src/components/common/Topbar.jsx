import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Bolt as QuickActionIcon,
  Add as AddBookIcon,
  SwapHoriz as BorrowIcon,
  KeyboardReturn as ReturnIcon,
  PersonAddOutlined as AddMemberIcon,
  PersonOutline as PersonIcon,
  Logout as LogoutIcon,
  LockReset as LockResetIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordDialog from '../auth/ChangePasswordDialog';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Topbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [quickAnchor, setQuickAnchor] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'librarian';

  const handleOpenProfile = (e) => setProfileAnchor(e.currentTarget);
  const handleCloseProfile = () => setProfileAnchor(null);

  const handleOpenQuick = (e) => setQuickAnchor(e.currentTarget);
  const handleCloseQuick = () => setQuickAnchor(null);

  const handleLogout = async () => {
    handleCloseProfile();
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          color: '#0F172A',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 68, px: { xs: 2, md: 3.5 } }}>
          {/* Left: Sidebar Toggle & Smart Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, maxWidth: 520 }}>
            <IconButton
              onClick={onToggleSidebar}
              edge="start"
              color="inherit"
              sx={{ color: '#515F74' }}
            >
              <MenuIcon />
            </IconButton>

            <TextField
              fullWidth
              size="small"
              placeholder="ค้นหารายการในห้องสมุด, ISBN, สมาชิก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              id="topbar-global-search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  bgcolor: '#F8FAFC',
                  height: '42px',
                  fontSize: '0.875rem',
                  fontFamily: '"Hanken Grotesk", sans-serif',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
                },
              }}
            />
          </Box>

          {/* Right: Quick Actions, Notifications, User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            {/* Quick Actions Speed-Dial Trigger (Staff/Admin Only) */}
            {isStaffOrAdmin && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenQuick}
                  startIcon={<QuickActionIcon sx={{ color: '#2563EB' }} />}
                  endIcon={<ArrowDownIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{
                    borderRadius: '20px',
                    borderColor: '#E2E8F0',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 2,
                    py: 0.8,
                    bgcolor: '#F8FAFC',
                    display: { xs: 'none', sm: 'inline-flex' },
                    '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE' },
                  }}
                >
                  การดำเนินการด่วน
                </Button>

                <Menu
                  anchorEl={quickAnchor}
                  open={Boolean(quickAnchor)}
                  onClose={handleCloseQuick}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      width: 230,
                      mt: 1,
                      borderRadius: '12px',
                      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                      border: '1px solid #E2E8F0',
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                      ทางลัดสำหรับการหมุนเวียนอากาศ
                    </Typography>
                  </Box>
                  <MenuItem onClick={() => { handleCloseQuick(); navigate('/staff/borrowings'); }}>
                    <ListItemIcon><BorrowIcon fontSize="small" sx={{ color: '#2563EB' }} /></ListItemIcon>
                    ยืมหนังสือ
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseQuick(); navigate('/staff/borrowings'); }}>
                    <ListItemIcon><ReturnIcon fontSize="small" sx={{ color: '#16A34A' }} /></ListItemIcon>
                    คืนหนังสือ
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleCloseQuick(); navigate('/staff/books'); }}>
                    <ListItemIcon><AddBookIcon fontSize="small" sx={{ color: '#0F172A' }} /></ListItemIcon>
                    เพิ่มหนังสือเล่มใหม่
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseQuick(); navigate('/staff/members'); }}>
                    <ListItemIcon><AddMemberIcon fontSize="small" sx={{ color: '#7C3AED' }} /></ListItemIcon>
                    ลงทะเบียนสมาชิก
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Notification Bell with Badge & Auto-polling */}
            <NotificationDropdown />

            {/* User Profile Avatar & Menu */}
            <Box
              onClick={handleOpenProfile}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '24px',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontFamily: '"Manrope", sans-serif',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>

              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', pr: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2, fontSize: '0.85rem' }}>
                  {user?.username || 'Library User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'capitalize', fontSize: '0.72rem' }}>
                  {user?.role || 'Member'}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleCloseProfile}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  width: 220,
                  mt: 1,
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #E2E8F0',
                },
              }}
            >
              <MenuItem onClick={() => { handleCloseProfile(); navigate('/member/profile'); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                โปรไฟล์ของฉัน
              </MenuItem>
              <MenuItem onClick={() => { handleCloseProfile(); setPasswordOpen(true); }}>
                <ListItemIcon><LockResetIcon fontSize="small" /></ListItemIcon>
                เปลี่ยนรหัสผ่าน
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#DC2626' }}>
                <ListItemIcon sx={{ color: '#DC2626' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                ออกจากระบบ
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Change Password Modal */}
      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default Topbar;
