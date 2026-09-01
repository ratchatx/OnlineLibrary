import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  CheckCircleOutline as ReadIcon,
  DoneAll as MarkAllIcon,
  BookmarkBorder as HoldIcon,
  AccessTime as DueIcon,
  MonetizationOnOutlined as FineIcon,
  InfoOutlined as SystemIcon,
} from '@mui/icons-material';
import notificationService from '../../services/notificationService';

const MemberNotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch {
      // Silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {
      // Silent
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'due_soon':
      case 'overdue':
        return <DueIcon sx={{ color: '#DC2626' }} />;
      case 'reservation_available':
        return <HoldIcon sx={{ color: '#16A34A' }} />;
      case 'fine_generated':
        return <FineIcon sx={{ color: '#D97706' }} />;
      default:
        return <SystemIcon sx={{ color: '#2563EB' }} />;
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'due') return n.type === 'due_soon' || n.type === 'overdue';
    if (activeTab === 'holds') return n.type === 'reservation_available';
    if (activeTab === 'fines') return n.type === 'fine_generated';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Page Header & Actions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A' }}>
              ศูนย์การแจ้งเตือน
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} New`} size="small" sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800 }} />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
           การแจ้งเตือนแบบเรียลไทม์สำหรับกำหนดส่งคืนหนังสือ หนังสือที่จองไว้พร้อมให้รับ และการอัปเดตข้อมูลค่าธรรมเนียม.
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleMarkAllAsRead}
            startIcon={<MarkAllIcon />}
            sx={{ borderRadius: '8px', fontWeight: 700 }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {/* ── 2. Category Tabs ── */}
      <Paper elevation={0} sx={{ p: 1, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              px: 2,
            },
          }}
        >
          <Tab value="all" label="การแจ้งเตือนทั้งหมด" />
          <Tab value="unread" label={`ยังไม่ได้อ่าน (${unreadCount})`} />
          <Tab value="due" label="วันครบกำหนด" />
          <Tab value="holds" label="ชั้นวางพักสินค้า" />
          <Tab value="fines" label="ค่าปรับ" />
        </Tabs>
      </Paper>

      {/* ── 3. Notification Items List ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '12px' }} />
          ))
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <Paper
              key={n.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: `1px solid ${n.is_read ? '#E2E8F0' : '#BFDBFE'}`,
                bgcolor: n.is_read ? '#FFFFFF' : '#EFF6FF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                transition: 'all 0.15s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: n.is_read ? '#F1F5F9' : '#FFFFFF', mt: 0.2 }}>
                  {getCategoryIcon(n.type)}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.3 }}>
                    {n.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.4, mb: 0.8 }}>
                    {n.message}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}
                  </Typography>
                </Box>
              </Box>

              {!n.is_read && (
                <Tooltip title="Mark as Read">
                  <IconButton size="small" onClick={() => handleMarkAsRead(n.id)} sx={{ color: '#2563EB' }}>
                    <ReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
              จัดการเรียบร้อยแล้ว! 🎉
            </Typography>
            <Typography variant="body2" color="text.secondary">
              คุณไม่มีการแจ้งเตือนในหมวดหมู่นี้.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default MemberNotificationsPage;
