import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
} from '@mui/material';
import { MenuBook as BookIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const isAvailable = (book.available_copies || 0) > 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          height: 220,
          bgcolor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {book.cover_image_url ? (
          <CardMedia
            component="img"
            image={book.cover_image_url}
            alt={book.title}
            sx={{ height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <Box sx={{ color: 'text.secondary', textAlign: 'center' }}>
            <BookIcon sx={{ fontSize: 60, opacity: 0.4 }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              ไม่มีรูปหน้าปก
            </Typography>
          </Box>
        )}

        {/* Availability Badge */}
        <Chip
          label={isAvailable ? `พร้อมยืม (${book.available_copies}/${book.total_copies})` : 'ยืมหมดแล้ว (0 เล่ม)'}
          color={isAvailable ? 'success' : 'error'}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        />
      </Box>

      {/* Card Body */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Chip
          label={book.category_name || 'ทั่วไป'}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ mb: 1, height: 22, fontSize: '0.7rem' }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.3,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em',
          }}
        >
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
          ผู้แต่ง: {book.author || 'ไม่ระบุ'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          ISBN: {book.isbn || '-'} | {book.publish_year || '-'}
        </Typography>
      </CardContent>

      {/* Card Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<ViewIcon />}
          onClick={() => navigate(`/books/${book.id}`)}
          size="small"
        >
          ดูรายละเอียด (Details)
        </Button>
      </CardActions>
    </Card>
  );
};

export default BookCard;
