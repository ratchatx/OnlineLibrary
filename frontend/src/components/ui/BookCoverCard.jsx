import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  MenuBook as BookIcon,
  BookmarkBorder as ReserveIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
} from '@mui/icons-material';

/**
 * Reusable BookCoverCard Component
 * High-fidelity 3D book card showcase with stock status and context actions
 */
const BookCoverCard = ({
  book,
  onViewDetails,
  onBorrow,
  onReserve,
  showActions = true,
}) => {
  const availableCopies = book.available_copies ?? book.total_copies ?? 0;
  const totalCopies = book.total_copies ?? 1;
  const isAvailable = availableCopies > 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.22s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.09)',
          borderColor: '#CBD5E1',
          '& .book-cover-img': {
            transform: 'scale(1.03)',
          },
        },
      }}
    >
      {/* Book Cover Image Area with 3D Effect */}
      <Box
        sx={{
          height: 220,
          bgcolor: '#F1F5F9',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        {book.cover_image_url ? (
          <CardMedia
            component="img"
            image={book.cover_image_url}
            alt={book.title}
            className="book-cover-img"
            sx={{
              height: '100%',
              maxWidth: 140,
              objectFit: 'cover',
              borderRadius: '6px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              transition: 'transform 0.3s ease',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 120,
              height: 170,
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: '6px',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            }}
          >
            <BookIcon sx={{ color: '#94A3B8', fontSize: 24 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                lineHeight: 1.2,
                color: '#F8FAFC',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>
              Aura Library
            </Typography>
          </Box>
        )}

        {/* Availability Badge Overlay */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Chip
            label={isAvailable ? `In Stock (${availableCopies}/${totalCopies})` : 'Checked Out'}
            size="small"
            sx={{
              bgcolor: isAvailable ? 'rgba(22, 163, 74, 0.92)' : 'rgba(220, 38, 38, 0.92)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.68rem',
              backdropFilter: 'blur(4px)',
              height: 22,
            }}
          />
        </Box>
      </Box>

      {/* Book Metadata Content */}
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category Tag */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {book.category_name || 'Academic'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#F59E0B' }}>
            <StarIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>
              4.8
            </Typography>
          </Box>
        </Box>

        {/* Title */}
        <Tooltip title={book.title}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: '#0F172A',
              fontSize: '0.95rem',
              lineHeight: 1.35,
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: '"Manrope", sans-serif',
              cursor: 'pointer',
              '&:hover': { color: '#2563EB' },
            }}
            onClick={onViewDetails}
          >
            {book.title}
          </Typography>
        </Tooltip>

        {/* Author & ISBN */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: '0.82rem',
            mb: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {book.author || 'Unknown Author'}
        </Typography>

        {/* Action Buttons */}
        {showActions && (
          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={onViewDetails}
              sx={{
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.78rem',
                py: 0.6,
                borderColor: '#CBD5E1',
                color: '#334155',
                '&:hover': { borderColor: '#2563EB', color: '#2563EB', bgcolor: '#EFF6FF' },
              }}
            >
              Details
            </Button>

            {isAvailable && onBorrow ? (
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={onBorrow}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  py: 0.6,
                  bgcolor: '#2563EB',
                }}
              >
                Borrow
              </Button>
            ) : onReserve ? (
              <Button
                variant="contained"
                size="small"
                fullWidth
                color="warning"
                onClick={onReserve}
                startIcon={<ReserveIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  py: 0.6,
                }}
              >
                Reserve
              </Button>
            ) : null}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BookCoverCard;
