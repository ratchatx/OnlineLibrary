import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  Tooltip,
} from '@mui/material';
import {
  MenuBook as BookIcon,
  PeopleAlt as MemberIcon,
  SwapHoriz as BorrowIcon,
  WarningAmber as OverdueIcon,
  BookmarkBorder as ReserveIcon,
  MonetizationOnOutlined as FineIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon,
  Bolt as QuickDeskIcon,
  PriorityHigh as UrgentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import dashboardService from '../../services/dashboardService';
import circulationService from '../../services/circulationService';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';

/* ── Interactive Spline Curve Chart ────────────────────── */
const CirculationSplineChart = ({ period }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const trendData = [
    { month: 'Mar', borrows: 42, returns: 38 },
    { month: 'Apr', borrows: 78, returns: 65 },
    { month: 'May', borrows: 56, returns: 52 },
    { month: 'Jun', borrows: 92, returns: 84 },
    { month: 'Jul', borrows: 85, returns: 80 },
    { month: 'Aug', borrows: 110, returns: 98 },
  ];

  const svgWidth = 560;
  const svgHeight = 220;
  const padX = 45;
  const padY = 30;

  const points = trendData.map((d, i) => ({
    ...d,
    x: padX + (i * (svgWidth - padX * 2)) / (trendData.length - 1),
    y: svgHeight - padY - (d.borrows / 140) * (svgHeight - padY * 2),
  }));

  const createSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${svgHeight - padY} L ${points[0].x},${svgHeight - padY} Z`;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 230 }}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight + 25}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Gridlines */}
        {[120, 80, 40, 0].map((val) => {
          const y = svgHeight - padY - (val / 140) * (svgHeight - padY * 2);
          return (
            <g key={val}>
              <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="#E2E8F0" strokeDasharray={val === 0 ? 'none' : '3 3'} strokeWidth="1" />
              <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">{val}</text>
            </g>
          );
        })}

        {/* Area & Line */}
        <path d={areaPath} fill="url(#splineAreaGrad)" />
        <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Points */}
        {points.map((pt, i) => (
          <g key={pt.month} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
            {hoveredIdx === i && <circle cx={pt.x} cy={pt.y} r="10" fill="#2563EB" fillOpacity="0.2" />}
            <circle cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 6 : 4.5} fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            <text x={pt.x} y={svgHeight + 16} textAnchor="middle" fontSize="12" fill="#64748B" fontWeight={hoveredIdx === i ? '700' : '500'}>
              {pt.month}
            </text>
            {hoveredIdx === i && (
              <g>
                <rect x={pt.x - 30} y={pt.y - 34} width="60" height="24" rx="6" fill="#0F172A" />
                <text x={pt.x} y={pt.y - 18} textAnchor="middle" fontSize="11" fill="#FFFFFF" fontWeight="700">
                  {pt.borrows} loans
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </Box>
  );
};

/* ── Main StaffDashboardPage Component ──────────────────── */
const StaffDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6months');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, borrowingsRes] = await Promise.allSettled([
        dashboardService.getStaffSummary(),
        circulationService.getBorrowings({ limit: 6, page: 1 }),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
        setSummary(summaryRes.value.data);
      }
      if (borrowingsRes.status === 'fulfilled' && borrowingsRes.value?.success) {
        setRecentLoans(borrowingsRes.value.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalBooks = summary?.total_books ?? 15420;
  const totalMembers = summary?.total_members ?? 8500;
  const activeBorrows = summary?.active_borrows ?? 1250;
  const overdueCount = summary?.overdue_count ?? 12;
  const pendingReservations = summary?.pending_reservations ?? 48;
  const unpaidFines = parseFloat(summary?.total_unpaid_fines || 2350);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 5 }}>
      {/* ── 1. Hero Welcome & Operations Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0F2942 0%, #1E3A5F 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2.5,
          boxShadow: '0 8px 30px rgba(15, 41, 66, 0.15)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
            <Typography variant="caption" sx={{ bgcolor: 'rgba(255, 255, 255, 0.18)', px: 1.5, py: 0.4, borderRadius: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
              ระบบสารสนเทศทางวิชาการ
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
              {currentDate}
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', mb: 0.8, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            ยินดีต้อนรับกลับมา, {user?.username || 'Administrator'}! 👋
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 650, lineHeight: 1.5 }}>
            ระบบการยืม-คืนของห้องสมุดกำลังดำเนินการโดย<strong>ความพร้อมใช้งาน 94.2%</strong>.ในขณะนี้มี<strong>{overdueCount} สินเชื่อที่ค้างชำระ</strong>สิ่งที่ต้องจัดการในวันนี้.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/staff/borrowings')}
            startIcon={<QuickDeskIcon sx={{ color: '#FDE047' }} />}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '24px',
              px: 3,
              py: 1.1,
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
              '&:hover': { bgcolor: '#1D4ED8', transform: 'translateY(-1px)' },
            }}
          >
            เคาน์เตอร์บริการยืม-คืน
          </Button>

          <Tooltip title="Refresh Dashboard Data">
            <Button
              onClick={loadData}
              variant="outlined"
              sx={{
                minWidth: 'auto',
                p: 1.1,
                borderRadius: '50%',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: '#FFFFFF' },
              }}
            >
              <RefreshIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* ── 2. Differentiated KPI Metrics Grid ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="จำนวนหนังสือทั้งหมด"
            value={totalBooks.toLocaleString()}
            unit="ชื่อเรื่อง"
            trend="+15.4%"
            trendType="up"
            icon={<BookIcon sx={{ fontSize: 20   }} />}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            loading={loading}
            onClick={() => navigate('/staff/books')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="จำนวนสมาชิกทั้งหมด"
            value={totalMembers.toLocaleString()}
            unit="ผู้ใช้"
            trend="+1.2%"
            trendType="up"
            icon={<MemberIcon sx={{ fontSize: 20 }} />}
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            loading={loading}
            onClick={() => navigate('/staff/members')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="รายการยืมที่ยังค้างอยู่"
            value={activeBorrows.toLocaleString()}
            unit="สินเชื่อ"
            trend="82% on-time"
            trendType="flat"
            icon={<BorrowIcon sx={{ fontSize: 20 }} />}
            iconBg="#E0F2FE"
            iconColor="#0284C7"
            loading={loading}
            onClick={() => navigate('/staff/borrowings')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="หนังสือที่เกินกำหนดส่งคืน"
            value={overdueCount.toLocaleString()}
            unit="การแจ้งเตือน"
            trend="ต้องการการดำเนินการ."
            trendType="danger"
            isUrgent={overdueCount > 0}
            icon={<OverdueIcon sx={{ fontSize: 20 }} />}
            iconBg="#FEE2E2"
            iconColor="#DC2626"
            loading={loading}
            onClick={() => navigate('/staff/borrowings')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="การระงับที่ใช้งานอยู่"
            value={pendingReservations.toLocaleString()}
            unit="ถือ"
            trend="14 ชิ้น พร้อมรับของ"
            trendType="up"
            icon={<ReserveIcon sx={{ fontSize: 20 }} />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            loading={loading}
            onClick={() => navigate('/staff/reservations')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="ค่าปรับที่ยังไม่ได้ชำระ"
            value={`฿${unpaidFines.toFixed(0)}`}
            trend="8 รายการที่รอดำเนินการ"
            trendType="danger"
            icon={<FineIcon sx={{ fontSize: 20 }} />}
            iconBg="#EDE9FE"
            iconColor="#7C3AED"
            loading={loading}
            onClick={() => navigate('/staff/fines')}
          />
        </Grid>
      </Grid>

      {/* ── 3. Middle Row: Analytics & Urgent Attention Desk ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left: Monthly Borrowing Trajectory */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', fontSize: '1.15rem' }}>
                  ความเร็วในการหมุนเวียนและแนวโน้มรายเดือน
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  ปริมาณการยืมหนังสือตลอดช่วง 6 เดือนของการศึกษาที่ผ่านมา
                </Typography>
              </Box>

              <FormControl size="small">
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  sx={{
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    height: '34px',
                    bgcolor: '#F8FAFC',
                  }}
                >
                  <MenuItem value="6months">6 เดือนที่ผ่านมา</MenuItem>
                  <MenuItem value="30days">30 วันที่ผ่านมา</MenuItem>
                  <MenuItem value="year">ปีปัจจุบัน</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <CirculationSplineChart period={period} />
          </Paper>
        </Grid>

        {/* Right: Urgent Attention & Alerts Panel */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
              <UrgentIcon sx={{ color: '#DC2626', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', fontSize: '1.1rem' }}>
                Urgent Action Items
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto' }}>
              {/* Alert Item 1 */}
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991B1B', fontSize: '0.85rem' }}>
                    🚨 15 Days Overdue
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700 }}>
                    Fine: ฿75.00
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.82rem' }}>
                  Advanced Calculus (Copy #BC-1002)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.2 }}>
                  Member: James Holden (ID: M-00109)
                </Typography>
              </Box>

              {/* Alert Item 2 */}
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', fontSize: '0.85rem' }}>
                    ⏳ Hold Expiring in 6 Hours
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>
                    Shelf H-04
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.82rem' }}>
                  Clean Code: Agile Software
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.2 }}>
                  Reserved for: Bruce Wayne (ID: M-00210)
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => navigate('/staff/borrowings')}
              sx={{ mt: 2, borderRadius: '8px', fontWeight: 700, color: '#0F172A', borderColor: '#CBD5E1' }}
            >
              View Circulation Desk
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 4. Bottom Row: Live Transactions Log ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3.5, py: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', fontSize: '1.15rem' }}>
              Live Circulation Feed & Transactions
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Real-time audit log of borrow, return, and fine settlement events
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowIcon fontSize="small" />}
            onClick={() => navigate('/staff/borrowings')}
            sx={{ fontWeight: 700, color: '#2563EB' }}
          >
            View All Records
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.8, px: 3.5 }}>TRANSACTION / LOAN</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>MEMBER NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>BOOK TITLE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>DUE DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.8, px: 3.5 }}>ACTION</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentLoans.length > 0 ? (
                recentLoans.map((loan) => (
                  <TableRow key={loan.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem', px: 3.5, py: 2 }}>
                      {loan.borrowing_code || `LN-${loan.id}`}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem', py: 2 }}>
                      {loan.member_name || loan.username || 'Student Member'}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.85rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', py: 2 }}>
                      {loan.book_title || 'Clean Code'}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '0.85rem', py: 2 }}>
                      {loan.due_date ? new Date(loan.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <StatusBadge status={loan.status} />
                    </TableCell>
                    <TableCell align="right" sx={{ px: 3.5, py: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate('/staff/borrowings')}
                        sx={{ borderRadius: '6px', py: 0.4, px: 1.5, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#64748B' }}>
                    No circulation activity recorded yet today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StaffDashboardPage;
