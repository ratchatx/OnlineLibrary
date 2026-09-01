import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  MenuBook as BorrowIcon,
  Schedule as DueIcon,
  WarningAmber as OverdueIcon,
  BookmarkAdded as ReserveIcon,
  MonetizationOn as FineIcon,
  CheckCircle as SuccessIcon,
  NotificationsNone as EmptyIcon,
  DoneAll as MarkAllIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

/* ── Helper: Get Icon & Color by Notification Type ────── */
const getNotificationMeta = (type) => {
  switch (type) {
    case 'borrow_success':
    case 'borrow':
      return {
        icon: <BorrowIcon fontSize="small" />,
        color: '#1E40AF',
        bgcolor: '#EFF6FF',
        route: '/member/my-borrows',
      };
    case 'due_soon':
      return {
        icon: <DueIcon fontSize="small" />,
        color: '#D97706',
        bgcolor: '#FEF3C7',
        route: '/member/my-borrows',
      };
    case 'overdue':
      return {
        icon: <OverdueIcon fontSize="small" />,
        color: '#DC2626',
        bgcolor: '#FEE2E2',
        route: '/member/my-borrows',
      };
    case 'reservation_ready':
    case 'reservation':
      return {
        icon: <ReserveIcon fontSize="small" />,
        color: '#059669',
        bgcolor: '#D1FAE5',
        route: '/member/my-reservations',
      };
    case 'fine_incurred':
    case 'fine':
      return {
        icon: <FineIcon fontSize="small" />,
        color: '#B45309',
        bgcolor: '#FFEDD5',
        route: '/member/my-fines',
      };
    case 'fine_paid':
      return {
        icon: <SuccessIcon fontSize="small" />,
        color: '#059669',
        bgcolor: '#ECFDF5',
        route: '/member/my-fines',
      };
    default:
      return {
        icon: <NotificationIcon fontSize="small" />,
        color: '#4B5563',
        bgcolor: '#F3F4F6',
        route: '/member/notifications',
      };
  }
};

/* ── Helper: Format Relative Time in Thai ─────────────── */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  if (diffDay === 1) return 'เมื่อวานนี้';
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
};

/* ── Main Component ───────────────────────────────────── */
const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 5, page: 1 });
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch {
      // Non-blocking background fetch
    }
  }, []);

  // Polling every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mark single as read
  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue navigation even if mark as read fails
      }
    }
    handleClose();
    const meta = getNotificationMeta(notif.type);
    navigate(meta.route);
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {
      // Ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="การแจ้งเตือน">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          sx={{ color: 'text.secondary' }}
          id="notification-bell-btn"
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              การแจ้งเตือน
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} ใหม่`}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={markingAll ? <CircularProgress size={12} /> : <MarkAllIcon fontSize="small" />}
              onClick={handleMarkAllRead}
              disabled={markingAll}
              sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' }}
              id="mark-all-read-btn"
            >
              อ่านทั้งหมด
            </Button>
          )}
        </Box>

        {/* List of Notifications */}
        <List sx={{ p: 0, maxHeight: 340, overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const meta = getNotificationMeta(notif.type);
              const isUnread = !notif.is_read;

              return (
                <ListItem
                  key={notif.id}
                  button
                  onClick={() => handleItemClick(notif)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #F8FAFC',
                    bgcolor: isUnread ? '#EFF6FF' : 'transparent',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor: isUnread ? '#DBEAFE' : '#F8FAFC',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: meta.bgcolor,
                        color: meta.color,
                      }}
                    >
                      {meta.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isUnread ? 700 : 500,
                            color: 'text.primary',
                            fontSize: '0.85rem',
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {isUnread && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.3,
                            mb: 0.5,
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                          {formatRelativeTime(notif.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })
          ) : (
            <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
              <EmptyIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                ไม่มีการแจ้งเตือนใหม่
              </Typography>
              <Typography variant="caption" color="text.disabled">
                เมื่อมีกิจกรรมเกี่ยวกับการยืมหรือการจอง จะแสดงที่นี่
              </Typography>
            </Box>
          )}
        </List>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              handleClose();
              navigate('/member/notifications');
            }}
            sx={{ fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
            id="view-all-notifications-btn"
          >
            ดูการแจ้งเตือนทั้งหมด
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
