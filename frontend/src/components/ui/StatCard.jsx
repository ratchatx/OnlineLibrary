import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, Chip } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

/**
 * Reusable StatCard Component
 * Displays key metrics with trend indicators, icon badges, and loading skeletons
 */
const StatCard = ({
  title,
  value,
  unit,
  trend,
  trendType = 'up', // 'up' | 'down' | 'flat' | 'danger'
  subtext,
  icon,
  iconBg = '#EFF6FF',
  iconColor = '#2563EB',
  borderColor,
  isUrgent = false,
  loading = false,
  onClick,
}) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case 'danger':
        return { bg: '#FEE2E2', color: '#991B1B', icon: <TrendingUpIcon fontSize="small" /> };
      case 'down':
        return { bg: '#FEE2E2', color: '#991B1B', icon: <TrendingDownIcon fontSize="small" /> };
      case 'flat':
        return { bg: '#E0E3E5', color: '#45464D', icon: <TrendingFlatIcon fontSize="small" /> };
      case 'up':
      default:
        return { bg: '#DCFCE7', color: '#166534', icon: <TrendingUpIcon fontSize="small" /> };
    }
  };

  const trendStyles = getTrendStyles();

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${borderColor || (isUrgent ? '#FECACA' : '#E2E8F0')}`,
        bgcolor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isUrgent
          ? '0 4px 20px rgba(220, 38, 38, 0.08)'
          : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 30px -4px rgba(37, 99, 235, 0.12)',
              borderColor: '#CBD5E1',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: '24px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header: Title & Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: isUrgent ? '#DC2626' : '#515F74',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Metric Value & Trend Badge */}
        {loading ? (
          <Skeleton variant="text" width={110} height={48} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 'auto', flexWrap: 'wrap' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.85rem', sm: '2.25rem' },
                lineHeight: 1,
                color: isUrgent ? '#DC2626' : '#0F172A',
                fontFamily: '"Manrope", sans-serif',
              }}
            >
              {value}
              {unit && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: '#64748B', fontWeight: 500, ml: 0.8, fontSize: '0.875rem' }}
                >
                  {unit}
                </Typography>
              )}
            </Typography>

            {trend && (
              <Chip
                icon={React.cloneElement(trendStyles.icon, { sx: { fontSize: '14px !important', mr: '-2px' } })}
                label={trend}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: trendStyles.bg,
                  color: trendStyles.color,
                }}
              />
            )}
          </Box>
        )}

        {/* Subtext */}
        {subtext && (
          <Typography
            variant="caption"
            sx={{ color: '#64748B', mt: 1, display: 'block', fontSize: '0.75rem' }}
          >
            {subtext}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
