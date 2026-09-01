import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon,
  MenuBookOutlined as BookIcon,
  SwapHorizOutlined as BorrowIcon,
  BookmarkBorderOutlined as ReservationIcon,
  PeopleAltOutlined as MemberIcon,
  WarningAmberOutlined as OverdueIcon,
  PaymentsOutlined as FineIcon,
  NotificationsNoneOutlined as NotificationIcon,
  AssessmentOutlined as ReportIcon,
  ManageAccountsOutlined as UserMgmtIcon,
  SecurityOutlined as AuditIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  AutoStories as LibraryLogoIcon,
  CheckCircleOutline as LoanIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 264;

const Sidebar = ({ role = 'librarian', mobileOpen, onMobileClose, desktopOpen = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isStaffOrAdmin = role === 'admin' || role === 'librarian';

  // Member Portal Navigation
  const memberMenu = [
    { section: 'ภาพรวม' },
    { text: 'หน้าหลัก', path: '/member/dashboard', icon: <DashboardIcon /> },
    { section: 'ห้องสมุด' },
    { text: 'รายการที่ฉันยืม', path: '/member/my-borrows', icon: <LoanIcon /> },
    { text: 'การจองของฉัน', path: '/member/my-reservations', icon: <ReservationIcon /> },
    { section: 'การเงินและประกาศ' },
    { text: 'ค่าปรับและการชำระเงิน', path: '/member/my-fines', icon: <FineIcon /> },
    { text: 'การแจ้งเตือน', path: '/member/notifications', icon: <NotificationIcon /> },
    { section: 'บัญชี' },
    { text: 'ประวัติโดยย่อ', path: '/member/profile', icon: <MemberIcon /> },
  ];

  // Staff & Admin Hybrid Categorized Navigation
  const staffMenu = [
    { section: 'ภาพรวม' },
    { text: 'หน้าหลัก', path: '/staff/dashboard', icon: <DashboardIcon /> },

    { section: 'การบริหารจัดการห้องสมุด' },
    { text: 'แคตตาล็อกหนังสือ', path: '/staff/books', icon: <BookIcon /> },
    { text: 'ยืมและคืน', path: '/staff/borrowings', icon: <BorrowIcon /> },
    { text: 'การจอง', path: '/staff/reservations', icon: <ReservationIcon /> },

    { section: 'ประชากร' },
    { text: 'ทำเนียบสมาชิก', path: '/staff/members', icon: <MemberIcon /> },
    ...(role === 'admin'
      ? [{ text: 'การจัดการผู้ใช้งาน', path: '/staff/members', icon: <UserMgmtIcon /> }]
      : []),

    { section: 'การติดตามและการเงิน' },
    { text: 'หนังสือที่เกินกำหนดส่งคืน', path: '/staff/borrowings', icon: <OverdueIcon />, isOverdue: true },
    { text: 'การบริหารจัดการค่าปรับ', path: '/staff/fines', icon: <FineIcon /> },
    { text: 'การแจ้งเตือน', path: '/member/notifications', icon: <NotificationIcon /> },

    { section: 'การวิเคราะห์และระบบ' },
    { text: 'รายงานและการวิเคราะห์', path: '/staff/reports', icon: <ReportIcon /> },
    ...(role === 'admin'
      ? [{ text: 'บันทึกการตรวจสอบ', path: '/admin/audit-logs', icon: <AuditIcon /> }]
      : []),
  ];

  const menuItems = isStaffOrAdmin ? staffMenu : memberMenu;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0F2942', // Deep Academic Navy Shell
        color: '#FFFFFF',
        py: 2,
      }}
    >
      {/* Brand Header */}
      <Box sx={{ px: 3, py: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1.8 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            flexShrink: 0,
          }}
        >
          <LibraryLogoIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#FFFFFF',
              fontFamily: '"Manrope", sans-serif',
              fontSize: '1.05rem',
              letterSpacing: '-0.01em',
            }}
          >
            Aura Library
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontWeight: 500,
              fontSize: '0.72rem',
              display: 'block',
            }}
          >
            Academic SaaS Platform
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 1 }} />

      {/* Navigation List */}
      <List sx={{ px: 2, flexGrow: 1, overflowY: 'auto', py: 0 }}>
        {menuItems.map((item, idx) => {
          if (item.section) {
            return (
              <Typography
                key={idx}
                variant="caption"
                sx={{
                  display: 'block',
                  px: 1.5,
                  pt: 2.2,
                  pb: 0.8,
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.65rem',
                  fontFamily: '"Hanken Grotesk", sans-serif',
                }}
              >
                {item.section}
              </Typography>
            );
          }

          const active =
            location.pathname === item.path ||
            (item.path === '/staff/dashboard' && location.pathname === '/staff');

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.4 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (onMobileClose) onMobileClose();
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.8,
                  bgcolor: active ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                  color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                  borderLeft: active ? '3px solid #60A5FA' : '3px solid transparent',
                  fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: active ? 'rgba(37, 99, 235, 0.35)' : 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: active ? '#60A5FA' : 'rgba(255, 255, 255, 0.65)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                    fontFamily: '"Hanken Grotesk", sans-serif',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1.5 }} />

      {/* User Profile Info & Bottom Actions */}
      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.82rem' }}>
              {user?.username || 'Authenticated User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'capitalize' }}>
              {role} role
            </Typography>
          </Box>

          <Tooltip title="Log Out">
            <Button
              size="small"
              onClick={handleLogout}
              sx={{
                minWidth: 'auto',
                p: 0.8,
                color: '#F87171',
                borderRadius: '8px',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' },
              }}
            >
              <LogoutIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
