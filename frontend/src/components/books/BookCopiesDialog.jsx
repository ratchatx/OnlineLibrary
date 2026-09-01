import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import bookService from '../../services/bookService';

const BookCopiesDialog = ({ open, onClose, book, onRefreshBook }) => {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Copy Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const loadCopies = async () => {
    if (!book) return;
    setLoading(true);
    setError('');
    try {
      const res = await bookService.getBookCopies(book.id);
      if (res.success) {
        setCopies(res.data?.copies || (Array.isArray(res.data) ? res.data : []));
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลสำเนาเล่มจริงได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && book) {
      loadCopies();
      setShowAddForm(false);
      setError('');
      setSuccess('');
    }
  }, [open, book]);

  const handleAddCopy = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setError('กรุณาระบุรหัสบาร์โค้ด');
      return;
    }

    try {
      await bookService.createBookCopy(book.id, {
        barcode: barcode.trim(),
        price: price ? parseFloat(price) : null,
        notes: notes.trim() || null,
      });

      setSuccess('เพิ่มสำเนาเล่มจริงสำเร็จ!');
      setBarcode('');
      setPrice('');
      setNotes('');
      setShowAddForm(false);
      loadCopies();
      if (onRefreshBook) onRefreshBook();
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถเพิ่มสำเนาเล่มจริงได้ (อาจมีบาร์โค้ดซ้ำ)');
    }
  };

  const handleStatusChange = async (copyId, newStatus) => {
    try {
      await bookService.updateBookCopy(copyId, { status: newStatus });
      loadCopies();
      if (onRefreshBook) onRefreshBook();
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะสำเนาได้');
    }
  };

  const handleDeleteCopy = async (copyId) => {
    if (!window.confirm('คุณต้องการลบสำเนาเล่มนี้ใช่หรือไม่?')) return;
    try {
      await bookService.deleteBookCopy(copyId);
      setSuccess('ลบสำเนาเรียบร้อยแล้ว');
      loadCopies();
      if (onRefreshBook) onRefreshBook();
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถลบสำเนาได้ (อาจมีรายการยืมค้างอยู่)');
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon color="primary" /> จัดการสำเนาเล่มจริง (Manage Physical Copies)
        </Box>
        {!showAddForm && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
          >
            เพิ่มสำเนาใหม่
          </Button>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          {book.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          ISBN: {book.isbn} | จำนวนสำเนาทั้งหมด: {copies.length} เล่ม
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Add Copy Form */}
        {showAddForm && (
          <Box component="form" onSubmit={handleAddCopy} sx={{ p: 2.5, mb: 3, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              ➕ บันทึกข้อมูลสำเนาเล่มใหม่
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <TextField
                label="รหัสบาร์โค้ด (Barcode)"
                size="small"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="เช่น BC-0001"
                required
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="ราคา (บาท)"
                type="number"
                size="small"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                sx={{ width: 140 }}
              />
              <TextField
                label="หมายเหตุ"
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => setShowAddForm(false)} color="inherit">
                ยกเลิก
              </Button>
              <Button type="submit" size="small" variant="contained" color="primary">
                บันทึกสำเนา
              </Button>
            </Box>
          </Box>
        )}

        {/* Copies Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ลำดับ</TableCell>
                <TableCell>รหัสบาร์โค้ด (Barcode)</TableCell>
                <TableCell>สถานะสำเนา</TableCell>
                <TableCell>เปลี่ยนสถานะ</TableCell>
                <TableCell>ราคา</TableCell>
                <TableCell align="right">การจัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {copies.length > 0 ? (
                copies.map((copy) => (
                  <TableRow key={copy.id}>
                    <TableCell sx={{ fontWeight: 600 }}>เล่มที่ {copy.copy_number}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{copy.barcode}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          copy.status === 'available'
                            ? 'พร้อมยืม'
                            : copy.status === 'borrowed'
                            ? 'ถูกยืม'
                            : copy.status === 'reserved_hold'
                            ? 'สำรองรอรับ'
                            : copy.status === 'maintenance'
                            ? 'ซ่อมบำรุง'
                            : 'สูญหาย'
                        }
                        color={
                          copy.status === 'available'
                            ? 'success'
                            : copy.status === 'borrowed'
                            ? 'default'
                            : copy.status === 'reserved_hold'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      {copy.status !== 'borrowed' && copy.status !== 'reserved_hold' && (
                        <TextField
                          select
                          size="small"
                          value={copy.status}
                          onChange={(e) => handleStatusChange(copy.id, e.target.value)}
                          sx={{ width: 130 }}
                        >
                          <MenuItem value="available">พร้อมยืม</MenuItem>
                          <MenuItem value="maintenance">ส่งซ่อม</MenuItem>
                          <MenuItem value="lost">สูญหาย</MenuItem>
                        </TextField>
                      )}
                    </TableCell>
                    <TableCell>{copy.price ? `฿${copy.price}` : '-'}</TableCell>
                    <TableCell align="right">
                      {copy.status === 'available' && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteCopy(copy.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    ไม่มีสำเนาเล่มจริงในระบบ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          ปิดหน้าต่าง
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookCopiesDialog;
