import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  Pagination,
  IconButton,
  Tooltip,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as TableViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import bookService from '../../services/bookService';
import BookCoverCard from '../../components/ui/BookCoverCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const BookCatalogPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookService.getBooks({
        search: search.trim() || undefined,
        category_id: selectedCategory || undefined,
        page,
        limit: 12,
        sort: sortBy,
      });

      if (res.success) {
        let list = res.data || [];
        if (inStockOnly) {
          list = list.filter((b) => (b.available_copies ?? b.total_copies ?? 0) > 0);
        }
        setBooks(list);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || list.length);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, page, sortBy, inStockOnly]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await bookService.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId === selectedCategory ? '' : catId);
    setPage(1);
  };

  // Table Columns Definition for Table View
  const tableColumns = [
    {
      id: 'cover',
      label: 'ปิดบัง',
      width: 80,
      render: (book) => (
        <Box
          sx={{
            width: 44,
            height: 60,
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
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#94A3B8' }}>ไม่มีค่าเข้า</Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'title',
      label: 'ชื่อหนังสือ',
      render: (book) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', cursor: 'pointer', '&:hover': { color: '#2563EB' } }} onClick={() => navigate(`/books/${book.id}`)}>
            {book.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {book.author || 'Unknown Author'} • ISBN: {book.isbn || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'หมวดหมู่',
      render: (book) => (
        <Chip label={book.category_name || 'Academic'} size="small" sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
      ),
    },
    {
      id: 'availability',
      label: 'ความพร้อมให้บริการ',
      render: (book) => {
        const avail = book.available_copies ?? book.total_copies ?? 0;
        const tot = book.total_copies ?? 1;
        return (
          <StatusBadge
            status={avail > 0 ? 'available' : 'borrowed'}
            customLabel={avail > 0 ? `In Stock (${avail}/${tot})` : 'Checked Out'}
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'การดำเนินการ',
      align: 'right',
      render: (book) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate(`/books/${book.id}`)}
          sx={{ borderRadius: '6px', fontWeight: 700, px: 2, fontSize: '0.75rem' }}
        >
          ดูรายละเอียด
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* ── 1. Catalog Header & Global Search Bar ── */}
      <Box sx={{ mb: 4, textAlign: 'center', pt: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontFamily: '"Manrope", sans-serif',
            color: '#0F172A',
            letterSpacing: '-0.02em',
            mb: 1,
            fontSize: { xs: '1.85rem', md: '2.5rem' },
          }}
        >
          Library Resource Discovery
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 650, mx: 'auto', mb: 3.5 }}>
          ค้นหาข้อมูลจากตำราวิชาการ งานวิจัย เอกสารวิชาการเฉพาะเรื่อง และสิ่งพิมพ์ของมหาวิทยาลัยจำนวนนับพันรายการ.
        </Typography>

        {/* Search Input Box */}
        <Paper
          component="form"
          onSubmit={handleSearchSubmit}
          elevation={0}
          sx={{
            maxWidth: 680,
            mx: 'auto',
            p: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '30px',
            border: '2px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)',
            '&:focus-within': { borderColor: '#2563EB', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15)' },
          }}
        >
          <SearchIcon sx={{ color: '#94A3B8', ml: 1.5, mr: 1, fontSize: '1.4rem' }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="ค้นหาชื่อเรื่อง ผู้แต่ง หัวข้อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ fontSize: '1rem', fontFamily: '"Hanken Grotesk", sans-serif' }}
          />
          {search && (
            <IconButton size="small" onClick={() => { setSearch(''); fetchBooks(); }} sx={{ mr: 0.5 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: '24px', 
              px: 3,
              py: 1,
              fontWeight: 800,
              bgcolor: '#2563EB',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            ค้นหา
          </Button>
        </Paper>
      </Box>

      {/* ── 2. Category Filter Chips & Controls Row ── */}
      <Box sx={{ mb: 3.5 }}>
        {/* Category Chips Carousel */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2 }}>
          <Chip
            label="All Categories"
            clickable
            onClick={() => handleCategorySelect('')}
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              py: 2.2,
              px: 1.5,
              borderRadius: '20px',
              bgcolor: selectedCategory === '' ? '#0F2942' : '#FFFFFF',
              color: selectedCategory === '' ? '#FFFFFF' : '#475569',
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: selectedCategory === '' ? '#1E3A5F' : '#F1F5F9' },
            }}
          />
          {categories.map((cat) => {
            const isSelected = selectedCategory === String(cat.id);
            return (
              <Chip
                key={cat.id}
                label={cat.name}
                clickable
                onClick={() => handleCategorySelect(String(cat.id))}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  py: 2.2,
                  px: 1.5,
                  borderRadius: '20px',
                  bgcolor: isSelected ? '#0F2942' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: '1px solid #E2E8F0',
                  '&:hover': { bgcolor: isSelected ? '#1E3A5F' : '#F1F5F9' },
                }}
              />
            );
          })}
        </Box>

        {/* Sub-controls: In-stock filter, Sort By, View Mode Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
              Showing <strong>{books.length}</strong> of <strong>{totalCount}</strong> books
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  size="small"
                  sx={{ color: '#2563EB', '&.Mui-checked': { color: '#2563EB' } }}
                />
              }
              label={<Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>In-Stock Only</Typography>}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, bgcolor: '#FFFFFF' }}
              >
                <MenuItem value="newest">สินค้ามาใหม่ล่าสุด</MenuItem>
                <MenuItem value="popular">ยอดนิยมที่สุด</MenuItem>
                <MenuItem value="title_asc">ชื่อเรื่อง (A-Z)</MenuItem>
              </Select>
            </FormControl>

            {/* View Mode Toggle */}
            <Paper elevation={0} sx={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: '8px', p: 0.3, bgcolor: '#FFFFFF' }}>
              <Tooltip title="Grid View">
                <IconButton
                  size="small"
                  onClick={() => setViewMode('grid')}
                  sx={{
                    borderRadius: '6px',
                    bgcolor: viewMode === 'grid' ? '#EFF6FF' : 'transparent',
                    color: viewMode === 'grid' ? '#2563EB' : '#64748B',
                  }}
                >
                  <GridViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Table View">
                <IconButton
                  size="small"
                  onClick={() => setViewMode('table')}
                  sx={{
                    borderRadius: '6px',
                    bgcolor: viewMode === 'table' ? '#EFF6FF' : 'transparent',
                    color: viewMode === 'table' ? '#2563EB' : '#64748B',
                  }}
                >
                  <TableViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* ── 3. Books Display (Grid or Table) ── */}
      {viewMode === 'grid' ? (
        books.length > 0 ? (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <BookCoverCard
                  book={book}
                  onViewDetails={() => navigate(`/books/${book.id}`)}
                  onReserve={() => navigate(`/books/${book.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <EmptyState
              title="ไม่พบหนังสือ"
              description="ไม่มีรายการในแคตตาล็อกที่ตรงกับคำค้นหาหรือเกณฑ์การกรองที่คุณเลือก ลองล้างตัวกรองการค้นหาดู."
              actionLabel="ล้างตัวกรอง"
              onAction={() => { setSearch(''); setSelectedCategory(''); setInStockOnly(false); }}
            />
          </Paper>
        )
      ) : (
        <DataTable
          columns={tableColumns}
          data={books}
          loading={loading}
          emptyTitle="No Books Found"
        />
      )}

      {/* ── 4. Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 700,
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default BookCatalogPage;
