import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardMedia,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  BookmarkBorder as ReserveIcon,
  SwapHoriz as BorrowIcon,
  LocationOn as LocationIcon,
  CheckCircle as InStockIcon,
  Cancel as OutOfStockIcon,
  Star as StarIcon,
  Share as ShareIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import bookService from '../../services/bookService';
import circulationService from '../../services/circulationService';
import StatusBadge from '../../components/ui/StatusBadge';
import BookCoverCard from '../../components/ui/BookCoverCard';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [reserving, setReserving] = useState(false);

  const fetchBookDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookService.getBookById(id);
      if (res.success) {
        setBook(res.data);

        // Fetch physical copy barcode details
        const copiesRes = await bookService.getBookCopies(id);
        if (copiesRes.success) setCopies(copiesRes.data || []);

        // Fetch related books in the same category
        if (res.data.category_id) {
          const relRes = await bookService.getBooks({ category_id: res.data.category_id, limit: 4 });
          if (relRes.success) {
            setRelatedBooks((relRes.data || []).filter((b) => String(b.id) !== String(id)));
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleReserveSubmit = async () => {
    if (!user) {
      navigate(`/login?redirect=/books/${id}`);
      return;
    }

    setReserving(true);
    setReserveError('');
    try {
      await circulationService.reserveBook({ book_id: Number(id) });
      setReserveSuccess(true);
      setReserveModalOpen(false);
      fetchBookDetails();
    } catch (err) {
      setReserveError(err.response?.data?.message || err.message || 'Failed to place reservation.');
    } finally {
      setReserving(false);
    }
  };

  const isStaff = user?.role === 'admin' || user?.role === 'librarian';
  const availableCopies = book?.available_copies ?? book?.total_copies ?? 0;
  const totalCopies = book?.total_copies ?? 1;
  const isAvailable = availableCopies > 0;

  if (loading) {
    return (
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ maxWidth: '800px', mx: 'auto', p: 6, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Bibliographic Record Not Found</Typography>
        <Button variant="contained" onClick={() => navigate('/books')}>กลับไปที่แคตตาล็อก</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1280px', mx: 'auto', pb: 8, pt: 1 }}>
      {/* ── Navigation Breadcrumb Bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/books')}
          sx={{ fontWeight: 700, color: '#475569', borderRadius: '8px' }}
        >
          กลับไปที่แคตตาล็อก
        </Button>

        {isStaff && (
          <Button
            variant="outlined"
            onClick={() => navigate('/staff/books')}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Manage in Staff Console
          </Button>
        )}
      </Box>

      {reserveSuccess && (
        <Alert severity="success" sx={{ mb: 3.5, borderRadius: '12px', fontWeight: 600 }}>
          🎉 Reservation successfully confirmed! You have been allocated a queue spot. You will be notified when this copy is ready on the hold shelf.
        </Alert>
      )}

      {/* ── Main Editorial Showcase Card ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          mb: 5,
        }}
      >
        <Grid container spacing={5}>
          {/* Left Column: 3D Cover Display */}
          <Grid item xs={12} md={4.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 300,
                height: 420,
                borderRadius: '12px',
                bgcolor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 18px 40px -10px rgba(15, 23, 42, 0.25)',
                mb: 3,
              }}
            >
              {book.cover_image_url ? (
                <CardMedia
                  component="img"
                  image={book.cover_image_url}
                  alt={book.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
                  <BookIcon sx={{ fontSize: 48, mb: 1, color: '#94A3B8' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Aura Academic Press</Typography>
                </Box>
              )}
            </Box>

            {/* Quick Actions for Member / Staff */}
            <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {isAvailable ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => isStaff ? navigate('/staff/borrowings') : setReserveModalOpen(true)}
                  startIcon={<BorrowIcon />}
                  sx={{
                    bgcolor: '#2563EB',
                    borderRadius: '10px',
                    py: 1.3,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {isStaff ? 'Issue Loan at Desk' : 'คำร้องขอยืม / จอง'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  size="large"
                  onClick={() => setReserveModalOpen(true)}
                  startIcon={<ReserveIcon />}
                  sx={{
                    borderRadius: '10px',
                    py: 1.3,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                  }}
                >
                  Place Reservation Hold
                </Button>
              )}
            </Box>
          </Grid>

          {/* Right Column: Bibliographic Details */}
          <Grid item xs={12} md={7.5}>
            {/* Category & Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Chip
                label={book.category_name || 'General Academic'}
                sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#F59E0B' }}>
                <StarIcon sx={{ fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>4.9</Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>(มาตรฐานทางวิชาการ)</Typography>
              </Box>
            </Box>

            {/* Title & Author */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontFamily: '"Manrope", sans-serif',
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                mb: 1,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              {book.title}
            </Typography>

            <Typography variant="subtitle1" sx={{ color: '#475569', fontWeight: 600, mb: 3 }}>
              By <strong>{book.author || 'Unknown Author'}</strong> • Published by {book.publisher || 'University Press'} ({book.publication_year || '2023'})
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Shelf Location & Availability Grid */}
            <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      สถานที่ตั้ง
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <LocationIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {book.shelf_location || 'Floor 2, Stacks B-14'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: isAvailable ? '#F0FDF4' : '#FEF2F2', borderRadius: '12px', border: `1px solid ${isAvailable ? '#BBF7D0' : '#FECACA'}` }}>
                  <Typography variant="caption" sx={{ color: isAvailable ? '#166534' : '#991B1B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    สถานะสินค้าคงคลัง
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {isAvailable ? (
                      <InStockIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                    ) : (
                      <OutOfStockIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isAvailable ? '#166534' : '#991B1B' }}>
                      {availableCopies} of {totalCopies} มีฉบับพร้อมให้บริการ
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Synopsis / Description */}
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 1, fontSize: '1.1rem' }}>
              บทสรุปทางบรรณานุกรม
            </Typography>
            <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, mb: 4 }}>
              {book.description || 'ไม่มีรายละเอียดบรรณานุกรมเพิ่มเติมสำหรับรายการในแคตตาล็อกนี้ โปรดติดต่อจุดบริการข้อมูลเพื่อขอความช่วยเหลือเพิ่มเติม.'}
            </Typography>

            {/* Physical Barcodes Registry */}
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 1.5, fontSize: '1.1rem' }}>
              ฉบับจริงที่ผ่านการลงทะเบียนแล้ว
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
              {copies.length > 0 ? (
                copies.map((copy) => (
                  <Chip
                    key={copy.id}
                    label={`${copy.barcode} (${copy.status})`}
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      borderColor: copy.status === 'available' ? '#86EFAC' : '#E2E8F0',
                      bgcolor: copy.status === 'available' ? '#F0FDF4' : '#FFFFFF',
                    }}
                  />
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  ข้อมูลบาร์โค้ดได้รับการจัดการโดยอัตโนมัติที่เคาน์เตอร์บริการยืม-คืน.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Related Books Section ── */}
      {relatedBooks.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 3 }}>
            สิ่งพิมพ์ทางวิชาการที่เกี่ยวข้อง
          </Typography>
          <Grid container spacing={3}>
            {relatedBooks.map((relBook) => (
              <Grid item xs={12} sm={6} md={3} key={relBook.id}>
                <BookCoverCard
                  book={relBook}
                  onViewDetails={() => { navigate(`/books/${relBook.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Reservation Dialog ── */}
      <Dialog
        open={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, maxWidth: 460 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif' }}>
          ยืนยันการระงับการจอง
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            คุณต้องการจองไหมคะ/ครับ <strong>"{book.title}"</strong>?
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
              เงื่อนไขการจอง:
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
              • คุณจะได้รับจัดสรรคิวถัดไปในระบบพักสายรอรับบริการ.<br />
              • เมื่อมีการนำสำเนามาคืนแล้ว คุณจะมีเวลา 48 ชั่วโมงในการมารับสำเนานั้นจากชั้นวาง H-04.
            </Typography>
          </Box>

          {reserveError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
              {reserveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReserveModalOpen(false)} sx={{ fontWeight: 600 }}>ยกเลิก</Button>
          <Button
            onClick={handleReserveSubmit}
            variant="contained"
            disabled={reserving}
            sx={{ fontWeight: 700, bgcolor: '#2563EB' }}
          >
            {reserving ? 'Reserving...' : 'ยืนยันการพักสาย'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookDetailPage;
