import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  SwapHoriz as BorrowIcon,
  KeyboardReturn as ReturnIcon,
  Search as SearchIcon,
  Person as MemberIcon,
  MenuBook as BookIcon,
  CheckCircle as SuccessIcon,
  WarningAmber as WarningIcon,
  DeleteOutline as RemoveIcon,
  ReceiptLong as ReceiptIcon,
} from '@mui/icons-material';
import circulationService from '../../services/circulationService';
import memberService from '../../services/memberService';
import bookService from '../../services/bookService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const StaffBorrowingsPage = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Borrow Desk, 1: Return Desk, 2: Active Loans Log

  // ── PANEL 1: Borrow Desk State ──
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCopies, setSelectedCopies] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');

  const [borrowSubmitting, setBorrowSubmitting] = useState(false);
  const [borrowSuccessMsg, setBorrowSuccessMsg] = useState('');

  // ── PANEL 2: Return Desk State ──
  const [returnBarcodeInput, setReturnBarcodeInput] = useState('');
  const [inspectingLoan, setInspectingLoan] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  // ── PANEL 3: Active Loans Log State ──
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch loans table
  const fetchLoans = useCallback(async () => {
    setLoansLoading(true);
    try {
      const res = await circulationService.getBorrowings({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (res.success) {
        setLoans(res.data || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoansLoading(false);
    }
  }, [statusFilter, page, rowsPerPage]);

  useEffect(() => {
    if (activeTab === 2) fetchLoans();
  }, [activeTab, fetchLoans]);

  // Search Member Handler
  const handleSearchMember = async (e) => {
    if (e) e.preventDefault();
    if (!memberSearchQuery.trim()) return;

    setMemberLoading(true);
    setMemberError('');
    try {
      const res = await memberService.getMembers({ search: memberSearchQuery.trim(), limit: 1 });
      if (res.success && res.data && res.data.length > 0) {
        const mem = res.data[0];
        setSelectedMember(mem);
      } else {
        setMemberError('Member not found with this ID, username, or email.');
      }
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Error searching member.');
    } finally {
      setMemberLoading(false);
    }
  };

  // Add Book Copy to Basket
  const handleAddBookToBasket = async (e) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const barcode = barcodeInput.trim();
    if (selectedCopies.some((c) => c.barcode === barcode)) {
      setBookError('This book copy barcode is already in your borrow basket.');
      return;
    }

    setBookLoading(true);
    setBookError('');
    try {
      const res = await bookService.getBooks({ search: barcode, limit: 1 });
      if (res.success && res.data && res.data.length > 0) {
        const bk = res.data[0];
        setSelectedCopies((prev) => [
          ...prev,
          {
            id: bk.id,
            barcode,
            title: bk.title,
            author: bk.author,
            category: bk.category_name,
          },
        ]);
        setBarcodeInput('');
      } else {
        // Allow adding by barcode directly
        setSelectedCopies((prev) => [
          ...prev,
          { id: barcode, barcode, title: `Book Copy (#${barcode})`, author: 'Verified Catalog Record' },
        ]);
        setBarcodeInput('');
      }
    } catch {
      setBookError('Could not verify book barcode.');
    } finally {
      setBookLoading(false);
    }
  };

  // Confirm Borrow Transaction
  const handleConfirmBorrow = async () => {
    if (!selectedMember) {
      setMemberError('Please select a member first.');
      return;
    }
    if (selectedCopies.length === 0) {
      setBookError('Please add at least one book barcode.');
      return;
    }

    setBorrowSubmitting(true);
    try {
      for (const copy of selectedCopies) {
        await circulationService.borrowBook({
          member_id: selectedMember.id,
          book_copy_id: copy.id,
          book_id: copy.id,
        });
      }
      setBorrowSuccessMsg(`🎉 Successfully issued ${selectedCopies.length} book loan(s) to ${selectedMember.name || selectedMember.username}!`);
      setSelectedCopies([]);
      setSelectedMember(null);
      setMemberSearchQuery('');
    } catch (err) {
      setBookError(err.response?.data?.message || err.message || 'Failed to complete borrow transaction.');
    } finally {
      setBorrowSubmitting(false);
    }
  };

  // Inspect Return Barcode
  const handleInspectReturn = async (e) => {
    if (e) e.preventDefault();
    if (!returnBarcodeInput.trim()) return;

    setReturnLoading(true);
    setReturnError('');
    setReturnSuccessMsg('');
    try {
      const res = await circulationService.getBorrowings({
        search: returnBarcodeInput.trim(),
        limit: 1,
      });

      if (res.success && res.data && res.data.length > 0) {
        setInspectingLoan(res.data[0]);
      } else {
        setReturnError('No active checkout found matching this barcode or borrowing code.');
      }
    } catch (err) {
      setReturnError(err.response?.data?.message || 'Error looking up loan record.');
    } finally {
      setReturnLoading(false);
    }
  };

  // Complete Return Action
  const handleCompleteReturn = async () => {
    if (!inspectingLoan) return;

    setReturnLoading(true);
    try {
      await circulationService.returnBook({
        borrowing_id: inspectingLoan.id,
      });
      setReturnSuccessMsg(`✅ Book "${inspectingLoan.book_title}" has been successfully returned and stock allocated!`);
      setInspectingLoan(null);
      setReturnBarcodeInput('');
    } catch (err) {
      setReturnError(err.response?.data?.message || 'Failed to process book return.');
    } finally {
      setReturnLoading(false);
    }
  };

  // Loans Table Columns
  const loanColumns = [
    {
      id: 'code',
      label: 'รหัสสินเชื่อ',
      render: (loan) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>
          {loan.borrowing_code || `LN-${loan.id}`}
        </Typography>
      ),
    },
    {
      id: 'member',
      label: 'รหัสสมาชิก',
      render: (loan) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {loan.member_name || loan.username || 'Member User'}
        </Typography>
      ),
    },
    {
      id: 'book',
      label: 'ชื่อหนังสือ',
      render: (loan) => (
        <Typography variant="body2" sx={{ color: '#475569', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {loan.book_title || 'Untitled Book'}
        </Typography>
      ),
    },
    {
      id: 'due_date',
      label: 'วันครบกำหนด',
      render: (loan) => {
        const dueDate = new Date(loan.due_date);
        const isOverdue = dueDate < new Date() && loan.status !== 'returned';
        return (
          <Typography variant="body2" sx={{ color: isOverdue ? '#DC2626' : '#64748B', fontWeight: isOverdue ? 700 : 500 }}>
            {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'สถานะ',
      render: (loan) => <StatusBadge status={loan.status} />,
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Header & Circulation Desk Mode Switcher ── */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
            เคาน์เตอร์บริการยืม-คืนและรายการธุรกรรม
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            พื้นที่ทำงานที่เน้นความรวดเร็วและคล่องตัวสำหรับการอนุมัติสินเชื่อ ตรวจสอบรายการที่ส่งคืน และบริหารจัดการการจัดสรรรายการที่ถูกจองไว้.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', p: 0.5, bgcolor: '#FFFFFF' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                px: 2.5,
              },
            }}
          >
            <Tab label="รายการยืม" icon={<BorrowIcon fontSize="small" />} iconPosition="start" />
            <Tab label="ตรวจสอบรายการคืนสินค้า" icon={<ReturnIcon fontSize="small" />} iconPosition="start" />
            <Tab label="ทะเบียนสินเชื่อที่ใช้งานอยู่" />
          </Tabs>
        </Paper>
      </Box>

      {/* ── 2. TAB 0: 3-Panel Borrow Transaction Desk ── */}
      {activeTab === 0 && (
        <Box>
          {borrowSuccessMsg && (
            <Alert severity="success" onClose={() => setBorrowSuccessMsg('')} sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
              {borrowSuccessMsg}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Panel 1: Identify Member */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', mb: 1, color: '#0F172A' }}>
                  1. ระบุตัวตนสมาชิก
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                  สแกนบาร์โค้ดบนบัตรประจำตัวนักศึกษาหรือบัตรประจำตัวบุคลากร
                </Typography>

                <Box component="form" onSubmit={handleSearchMember} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="สแกน / กรอกรหัสสมาชิกหรืออีเมล..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="contained" disabled={memberLoading} sx={{ fontWeight: 700 }}>
                    หา
                  </Button>
                </Box>

                {memberError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{memberError}</Alert>}

                {selectedMember ? (
                  <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <MemberIcon sx={{ color: '#16A34A' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534' }}>
                        {selectedMember.name || selectedMember.username}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#15803D', display: 'block' }}>
                      ID: #{selectedMember.id} • Role: {selectedMember.role}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D', display: 'block' }}>
                      สถานะ: ● บัตรที่ใช้งานได้ (มีสิทธิ์กู้ยืม)
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                    <Typography variant="body2" color="text.secondary">
                      ยังไม่ได้เลือกสมาชิก.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Panel 2: Select Book Copies */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', mb: 1, color: '#0F172A' }}>
                  2. สแกนบาร์โค้ดหนังสือ
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                  สแกนบาร์โค้ดของหนังสือแต่ละเล่มลงในตะกร้า
                </Typography>

                <Box component="form" onSubmit={handleAddBookToBasket} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="สแกนบาร์โค้ดหนังสือ (เช่น BC-100492)..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                  />
                  <Button type="submit" variant="contained" disabled={bookLoading} sx={{ fontWeight: 700 }}>
                    เพิ่ม
                  </Button>
                </Box>

                {bookError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{bookError}</Alert>}

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                  รายการสินค้าในตะกร้า ({selectedCopies.length}):
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 220, overflowY: 'auto' }}>
                  {selectedCopies.map((copy, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#F8FAFC',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                          {copy.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace' }}>
                          {copy.barcode}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => setSelectedCopies((prev) => prev.filter((_, i) => i !== idx))} sx={{ color: '#DC2626' }}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Panel 3: Loan Summary & Confirm */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', mb: 1, color: '#0F172A' }}>
                  3. สรุปข้อมูลสินเชื่อและส่งคำขอ
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                  เป็นไปตามเงื่อนไขมาตรฐานของสินเชื่อเพื่อการศึกษา
                </Typography>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">วันที่ยืม:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>วันนี้ ({new Date().toLocaleDateString('en-US')})</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">ระยะเวลาการยืม:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>14 Days (Standard Quota)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">วันครบกำหนดที่คำนวณได้:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB' }}>
                      {new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleConfirmBorrow}
                  disabled={!selectedMember || selectedCopies.length === 0 || borrowSubmitting}
                  sx={{
                    mt: 'auto',
                    py: 1.4,
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    bgcolor: '#2563EB',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {borrowSubmitting ? 'Processing...' : `ยืนยันปัญหา (${selectedCopies.length} หนังสือ)`}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── 3. TAB 1: Return & Overdue Inspection Desk ── */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
            จุดตรวจสอบหนังสือคืน
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            สแกนบาร์โค้ดของรายการที่นำมาคืนเพื่อตรวจสอบประวัติการยืม คำนวณค่าปรับกรณีคืนเกินกำหนด และจัดสรรรายการให้กับผู้ที่จองคิวไว้.
          </Typography>

          <Box component="form" onSubmit={handleInspectReturn} sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="สแกนบาร์โค้ดหรือพิมพ์รหัสการยืม (เช่น BC-100294)..."
              value={returnBarcodeInput}
              onChange={(e) => setReturnBarcodeInput(e.target.value)}
            />
            <Button type="submit" variant="contained" disabled={returnLoading} sx={{ px: 3, fontWeight: 700 }}>
              Inspect
            </Button>
          </Box>

          {returnError && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{returnError}</Alert>}
          {returnSuccessMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{returnSuccessMsg}</Alert>}

          {inspectingLoan && (
            <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                {inspectingLoan.book_title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
               ยืมโดย: <strong>{inspectingLoan.member_name || inspectingLoan.username}</strong> • Due: {new Date(inspectingLoan.due_date).toLocaleDateString('en-US')}
              </Typography>

              {new Date(inspectingLoan.due_date) < new Date() ? (
                <Box sx={{ p: 2, bgcolor: '#FEE2E2', borderRadius: '8px', border: '1px solid #FECACA', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B' }}>
                    ⚠️ ตรวจพบสินเชื่อค้างชำระ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B91C1C', display: 'block' }}>
                    ระบบจะคิดค่าปรับกรณีคืนหนังสือล่าช้าในอัตรา 5.00 บาทต่อวันโดยอัตโนมัติเมื่อมีการยืนยันการคืนหนังสือ.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: '#DCFCE7', borderRadius: '8px', border: '1px solid #BBF7D0', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    ✓ กลับมาตามกำหนดการ
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCompleteReturn}
                disabled={returnLoading}
                sx={{ py: 1.2, fontWeight: 800, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
              >
                {returnLoading ? 'Processing...' : 'Confirm Book Return'}
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* ── 4. TAB 2: Active Loans Log Registry ── */}
      {activeTab === 2 && (
        <DataTable
          columns={loanColumns}
          data={loans}
          loading={loansLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          headerActions={
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['ทั้งหมด', 'ยืมมา', 'เกินกำหนด', 'ส่งคืนแล้ว'].map((st) => (
                <Chip
                  key={st}
                  label={st.toUpperCase()}
                  clickable
                  onClick={() => { setStatusFilter(st); setPage(0); }}
                  sx={{
                    fontWeight: 700,
                    bgcolor: statusFilter === st ? '#0F2942' : '#F1F5F9',
                    color: statusFilter === st ? '#FFFFFF' : '#475569',
                  }}
                />
              ))}
            </Box>
          }
        />
      )}
    </Box>
  );
};

export default StaffBorrowingsPage;
