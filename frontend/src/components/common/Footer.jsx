import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { AutoStories as LibraryLogoIcon } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E0E3E5',
        py: 5,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Grid container spacing={3} justifyContent="space-between" alignItems="center">
          {/* Footer Brand Info */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: '#131B2E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LibraryLogoIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: '"Hanken Grotesk", sans-serif',
                  color: '#191C1E',
                }}
              >
                Online Library Management System
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#515F74',
                fontSize: '0.82rem',
                fontFamily: '"Hanken Grotesk", sans-serif',
                lineHeight: 1.5,
              }}
            >
              ระบบสารสนเทศบริหารจัดการห้องสมุดดิจิทัลครบวงจร รองรับการสืบค้น ยืม-คืน การจองหนังสือ และการติดตามค่าปรับ
            </Typography>
          </Grid>

          {/* Copyright & Version */}
          <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography
              variant="body2"
              sx={{
                color: '#515F74',
                fontSize: '0.82rem',
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontWeight: 500,
              }}
            >
              © 2026 OLMS Library. All rights reserved.
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#76777D',
                fontSize: '0.75rem',
                fontFamily: '"Hanken Grotesk", sans-serif',
                display: 'block',
                mt: 0.5,
              }}
            >
              Version 1.0.0 (Phase 10 — UI Architecture)
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
