import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AutoStoriesOutlined as DefaultEmptyIcon } from '@mui/icons-material';

/**
 * Reusable EmptyState Component
 * Clean, modern illustration/icon container for empty data states
 */
const EmptyState = ({
  icon,
  title = 'No Data Found',
  description = 'There are no records matching your criteria.',
  actionLabel,
  onAction,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          bgcolor: '#F1F5F9',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        {icon || <DefaultEmptyIcon sx={{ fontSize: 32 }} />}
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#1E293B',
          fontSize: '1.05rem',
          mb: 0.8,
          fontFamily: '"Manrope", sans-serif',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#64748B',
          maxWidth: 420,
          lineHeight: 1.5,
          mb: actionLabel ? 2.5 : 0,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{
            borderRadius: '8px',
            fontWeight: 700,
            px: 2.5,
            py: 0.8,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
