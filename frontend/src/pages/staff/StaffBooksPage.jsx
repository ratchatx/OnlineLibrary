import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Inventory as StockIcon,
  MenuBook as BookIcon,
  Close as CloseIcon,
  AutoAwesome as AutoFillIcon,
} from '@mui/icons-material';
import bookService from '../../services/bookService';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SlideOverDrawer from '../../components/ui/SlideOverDrawer';

const StaffBooksPage = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer / Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editingBookId, setEditingBookId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author: '',
    category_id: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    shelf_location: 'Floor 1, Stacks A',
    total_copies: 3,
    description: '',
    cover_image_url: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);

  // Copies Modal
  const [copiesDialogOpen, setCopiesDialogOpen] = useState(false);
  const [selectedBookForCopies, setSelectedBookForCopies] = useState(null);
  const [copiesList, setCopiesList] = useState([]);
  const [newBarcode, setNewBarcode] = useState('');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookService.getBooks({
        search: search.trim() || undefined,
        category_id: selectedCat || undefined,
        page: page + 1,
        limit: rowsPerPage,
      });
      if (res.success) {
        setBooks(res.data || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, [search, selectedCat, page, rowsPerPage]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await bookService.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleOpenAddDrawer = () => {
    setEditingBookId(null);
    setFormData({
      title: '',
      isbn: '',
      author: '',
      category_id: categories[0]?.id || '',
      publisher: '',
      publication_year: new Date().getFullYear(),
      shelf_location: 'Floor 1, Stacks A',
      total_copies: 3,
      description: '',
      cover_image_url: '',
    });
    setActiveStep(0);
    setFormError('');
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (book) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title || '',
      isbn: book.isbn || '',
      author: book.author || '',
      category_id: book.category_id || categories[0]?.id || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || new Date().getFullYear(),
      shelf_location: book.shelf_location || 'Floor 1, Stacks A',
      total_copies: book.total_copies || 1,
      description: book.description || '',
      cover_image_url: book.cover_image_url || '',
    });
    setActiveStep(0);
    setFormError('');
    setDrawerOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.title.trim() || !formData.isbn.trim() || !formData.author.trim()) {
      setFormError('Please provide Book Title, ISBN, and Author name.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingBookId) {
        await bookService.updateBook(editingBookId, formData);
      } else {
        await bookService.createBook(formData);
      }
      setDrawerOpen(false);
      fetchBooks();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save book.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBook) return;
    try {
      await bookService.deleteBook(deletingBook.id);
      setDeleteDialogOpen(false);
      setDeletingBook(null);
      fetchBooks();
    } catch {
      // Silent
    }
  };

  // Manage Copies modal trigger
  const handleOpenCopiesDialog = async (book) => {
    setSelectedBookForCopies(book);
    setCopiesDialogOpen(true);
    try {
      const res = await bookService.getBookCopies(book.id);
      if (res.success) {
        setCopiesList(res.data || []);
      }
    } catch {
      // Fallback
    }
  };

  const handleAddCopy = async () => {
    if (!newBarcode.trim() || !selectedBookForCopies) return;
    try {
      await bookService.addBookCopy(selectedBookForCopies.id, { barcode: newBarcode.trim() });
      setNewBarcode('');
      const res = await bookService.getBookCopies(selectedBookForCopies.id);
      if (res.success) setCopiesList(res.data || []);
      fetchBooks();
    } catch {
      // Silent
    }
  };

  // Form Steps Definition
  const formSteps = ['Basic Information', 'Stock & Location', 'Cover & Synopsis'];

  // Table Columns Definition
  const columns = [
    {
      id: 'cover',
      label: 'Cover',
      width: 70,
      render: (book) => (
        <Box
          sx={{
            width: 40,
            height: 54,
            bgcolor: '#F1F5F9',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <BookIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
          )}
        </Box>
      ),
    },
    {
      id: 'title',
      label: 'Book Title & Author',
      render: (book) => (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: '#0F172A', cursor: 'pointer', '&:hover': { color: '#2563EB' } }}
            onClick={() => navigate(`/books/${book.id}`)}
          >
            {book.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {book.author} • ISBN: {book.isbn || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (book) => (
        <Chip label={book.category_name || 'Academic'} size="small" sx={{ fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '0.72rem' }} />
      ),
    },
    {
      id: 'copies',
      label: 'Availability',
      render: (book) => {
        const avail = book.available_copies ?? book.total_copies ?? 0;
        const tot = book.total_copies ?? 1;
        return (
          <StatusBadge
            status={avail > 0 ? 'available' : 'borrowed'}
            customLabel={`${avail} / ${tot} Available`}
          />
        );
      },
    },
    {
      id: 'shelf',
      label: 'Shelf Location',
      render: (book) => (
        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
          {book.shelf_location || 'Floor 1, Stacks A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (book) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Manage Physical Copy Barcodes">
            <IconButton size="small" onClick={() => handleOpenCopiesDialog(book)} sx={{ color: '#2563EB' }}>
              <StockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Book Details">
            <IconButton size="small" onClick={() => handleOpenEditDrawer(book)} sx={{ color: '#475569' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Book">
            <IconButton size="small" onClick={() => { setDeletingBook(book); setDeleteDialogOpen(true); }} sx={{ color: '#DC2626' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Page Header & Actions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif', color: '#0F172A', mb: 0.5 }}>
            Book Inventory & Catalog Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Register new bibliographic items, allocate copy stock, and manage shelf locations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleOpenAddDrawer}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#0F2942',
            color: '#FFFFFF',
            borderRadius: '10px',
            px: 2.8,
            py: 1,
            fontWeight: 700,
            '&:hover': { bgcolor: '#1E3A5F' },
          }}
        >
          Add New Book
        </Button>
      </Box>

      {/* ── 2. Data Table with Search & Category Filter ── */}
      <DataTable
        columns={columns}
        data={books}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        headerActions={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ width: { xs: '100%', sm: 340 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category Filter</InputLabel>
              <Select
                value={selectedCat}
                label="Category Filter"
                onChange={(e) => { setSelectedCat(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        }
      />

      {/* ── 3. Multi-Step Add / Edit Book SlideOverDrawer ── */}
      <SlideOverDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingBookId ? 'Edit Book Details' : 'Add New Book to Catalog'}
        subtitle="Complete the guided bibliographic steps below"
        width={580}
        footer={
          <>
            <Button onClick={() => setDrawerOpen(false)} sx={{ fontWeight: 600, color: '#64748B' }}>
              Cancel
            </Button>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep((prev) => prev - 1)} variant="outlined" sx={{ fontWeight: 700 }}>
                Back
              </Button>
            )}
            {activeStep < formSteps.length - 1 ? (
              <Button onClick={() => setActiveStep((prev) => prev + 1)} variant="contained" sx={{ fontWeight: 700, bgcolor: '#2563EB' }}>
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleFormSubmit}
                variant="contained"
                disabled={submitting}
                sx={{ fontWeight: 700, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
              >
                {submitting ? 'Saving...' : editingBookId ? 'Update Book' : 'Publish Book'}
              </Button>
            )}
          </>
        }
      >
        {/* Stepper Header */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {formSteps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.78rem' } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {formError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {formError}
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Book Title *"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Clean Architecture: A Craftsman's Guide"
            />
            <TextField
              label="ISBN-13 *"
              fullWidth
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="978-0134494166"
            />
            <TextField
              label="Author Name *"
              fullWidth
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Robert C. Martin"
            />
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category_id}
                label="Category *"
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Step 2: Stock & Shelf Location */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Publisher"
              fullWidth
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              placeholder="Prentice Hall"
            />
            <TextField
              label="Publication Year"
              type="number"
              fullWidth
              value={formData.publication_year}
              onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value, 10) })}
            />
            <TextField
              label="Shelf Location"
              fullWidth
              value={formData.shelf_location}
              onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
              placeholder="Floor 2, Stacks B, Shelf B-12"
            />
            {!editingBookId && (
              <TextField
                label="Initial Copy Count"
                type="number"
                fullWidth
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value, 10) })}
                helperText="System will automatically generate barcodes for each copy"
              />
            )}
          </Box>
        )}

        {/* Step 3: Synopsis & Cover Image */}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Cover Image URL"
              fullWidth
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              placeholder="https://images-na.ssl-images-amazon.com/..."
            />
            <TextField
              label="Book Description / Synopsis"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of the book..."
            />
            {formData.cover_image_url && (
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                  Cover Preview:
                </Typography>
                <img
                  src={formData.cover_image_url}
                  alt="Cover Preview"
                  style={{ height: 140, objectFit: 'cover', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Box>
            )}
          </Box>
        )}
      </SlideOverDrawer>

      {/* ── 4. Manage Copies Modal ── */}
      <Dialog
        open={copiesDialogOpen}
        onClose={() => setCopiesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Manrope", sans-serif' }}>
          Physical Copies & Barcodes: {selectedBookForCopies?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="New Barcode (e.g. BC-100492)..."
              value={newBarcode}
              onChange={(e) => setNewBarcode(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddCopy} sx={{ px: 3, fontWeight: 700 }}>
              Add Copy
            </Button>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Current Copies in Registry ({copiesList.length}):
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 260, overflowY: 'auto' }}>
            {copiesList.map((copy) => (
              <Box
                key={copy.id}
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
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {copy.barcode}
                </Typography>
                <StatusBadge status={copy.status} />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCopiesDialogOpen(false)} variant="contained" sx={{ fontWeight: 700 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 5. Delete Confirmation Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>
          Confirm Catalog Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Are you sure you want to delete <strong>"{deletingBook?.title}"</strong>? This will permanently remove the bibliographic record and its copy history.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffBooksPage;
