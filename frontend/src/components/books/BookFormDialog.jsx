import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
  Box,
} from '@mui/material';
import { MenuBook as BookIcon } from '@mui/icons-material';
import bookService from '../../services/bookService';

const initialFormData = {
  title: '',
  author: '',
  isbn: '',
  category_id: '',
  publisher: '',
  publish_year: '',
  edition: '',
  pages: '',
  language: 'ไทย',
  shelf_location: '',
  cover_image_url: '',
  description: '',
  total_copies: 1,
};

const BookFormDialog = ({ open, onClose, bookToEdit, categories, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(bookToEdit);

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        isbn: bookToEdit.isbn || '',
        category_id: bookToEdit.category_id || '',
        publisher: bookToEdit.publisher || '',
        publish_year: bookToEdit.publish_year || '',
        edition: bookToEdit.edition || '',
        pages: bookToEdit.pages || '',
        language: bookToEdit.language || 'ไทย',
        shelf_location: bookToEdit.shelf_location || '',
        cover_image_url: bookToEdit.cover_image_url || '',
        description: bookToEdit.description || '',
        total_copies: bookToEdit.total_copies || 1,
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [bookToEdit, open]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.isbn.trim() || !formData.category_id) {
      setError('กรุณากรอกชื่อหนังสือ, ISBN และเลือกหมวดหมู่');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        publish_year: formData.publish_year ? Number(formData.publish_year) : null,
        pages: formData.pages ? Number(formData.pages) : null,
        total_copies: formData.total_copies ? Number(formData.total_copies) : 1,
      };

      if (isEdit) {
        await bookService.updateBook(bookToEdit.id, payload);
      } else {
        await bookService.createBook(payload);
      }

      onSuccess(isEdit ? 'แก้ไขข้อมูลหนังสือสำเร็จ!' : 'เพิ่มหนังสือใหม่สำเร็จ!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ (อาจมี ISBN ซ้ำในระบบ)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <BookIcon color="primary" /> {isEdit ? 'แก้ไขข้อมูลหนังสือ (Edit Book)' : 'เพิ่มหนังสือใหม่ (Add New Book)'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            {/* Title */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="ชื่อหนังสือ (Book Title)"
                value={formData.title}
                onChange={handleChange('title')}
                required
                disabled={loading}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="หมวดหมู่ (Category)"
                value={formData.category_id}
                onChange={handleChange('category_id')}
                required
                disabled={loading}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Author */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ผู้แต่ง (Author)"
                value={formData.author}
                onChange={handleChange('author')}
                disabled={loading}
              />
            </Grid>

            {/* ISBN */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รหัส ISBN"
                value={formData.isbn}
                onChange={handleChange('isbn')}
                required
                disabled={loading}
              />
            </Grid>

            {/* Publisher */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="สำนักพิมพ์ (Publisher)"
                value={formData.publisher}
                onChange={handleChange('publisher')}
                disabled={loading}
              />
            </Grid>

            {/* Year & Edition */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="ปีที่พิมพ์"
                type="number"
                value={formData.publish_year}
                onChange={handleChange('publish_year')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="ครั้งที่พิมพ์"
                value={formData.edition}
                onChange={handleChange('edition')}
                disabled={loading}
              />
            </Grid>

            {/* Pages & Language */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="จำนวนหน้า"
                type="number"
                value={formData.pages}
                onChange={handleChange('pages')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="ภาษา"
                value={formData.language}
                onChange={handleChange('language')}
                disabled={loading}
              />
            </Grid>

            {/* Shelf Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ตำแหน่งชั้นวาง (Shelf Location)"
                placeholder="เช่น A-102"
                value={formData.shelf_location}
                onChange={handleChange('shelf_location')}
                disabled={loading}
              />
            </Grid>

            {/* Total Copies (Only when creating) */}
            {!isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="จำนวนสำเนาเริ่มต้น (Initial Copies)"
                  type="number"
                  value={formData.total_copies}
                  onChange={handleChange('total_copies')}
                  helperText="ระบบจะสร้าง Barcode สำเนาให้อัตโนมัติ"
                  disabled={loading}
                />
              </Grid>
            )}

            {/* Cover Image URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL รูปภาพหน้าปก (Cover Image URL)"
                placeholder="https://..."
                value={formData.cover_image_url}
                onChange={handleChange('cover_image_url')}
                disabled={loading}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="เรื่องย่อ / คำอธิบาย (Description)"
                value={formData.description}
                onChange={handleChange('description')}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default BookFormDialog;
