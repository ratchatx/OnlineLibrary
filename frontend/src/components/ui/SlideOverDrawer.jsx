import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Reusable SlideOverDrawer Component
 * Slide-in drawer panel for modern SaaS form editing and deep inspection
 */
const SlideOverDrawer = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 540,
  footer,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          maxWidth: '100vw',
          bgcolor: '#FFFFFF',
          boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: '#0F172A',
              fontFamily: '"Manrope", sans-serif',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748B',
            borderRadius: '8px',
            '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body Content */}
      <Box sx={{ p: 3.5, flexGrow: 1, overflowY: 'auto' }}>
        {children}
      </Box>

      {/* Optional Sticky Footer */}
      {footer && (
        <>
          <Divider />
          <Box
            sx={{
              p: 2.5,
              px: 3.5,
              bgcolor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1.5,
            }}
          >
            {footer}
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default SlideOverDrawer;
