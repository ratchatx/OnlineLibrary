import React from 'react';
import { Chip } from '@mui/material';

/**
 * Reusable StatusBadge Component
 * Standardizes status chips across all pages (borrowings, returns, reservations, fines, members)
 */
const StatusBadge = ({ status, customLabel, size = 'small', sx = {} }) => {
  const normalized = (status || '').toLowerCase().trim();

  let label = customLabel || status;
  let bg = '#F1F5F9';
  let color = '#475569';

  switch (normalized) {
    // Borrowing / Return Statuses
    case 'borrowed':
    case 'active':
      label = customLabel || 'Borrowed';
      bg = '#E0F2FE';
      color = '#0369A1';
      break;
    case 'returned':
    case 'completed':
      label = customLabel || 'Returned';
      bg = '#DCFCE7';
      color = '#15803D';
      break;
    case 'overdue':
      label = customLabel || 'Overdue';
      bg = '#FEE2E2';
      color = '#B91C1C';
      break;

    // Reservation Statuses
    case 'pending':
    case 'waiting':
      label = customLabel || 'In Queue';
      bg = '#FEF3C7';
      color = '#B45309';
      break;
    case 'available':
    case 'ready':
    case 'ready for pickup':
      label = customLabel || 'Ready on Hold';
      bg = '#DCFCE7';
      color = '#15803D';
      break;
    case 'cancelled':
      label = customLabel || 'Cancelled';
      bg = '#F1F5F9';
      color = '#64748B';
      break;
    case 'expired':
      label = customLabel || 'Expired';
      bg = '#FEE2E2';
      color = '#991B1B';
      break;

    // Fine Statuses
    case 'unpaid':
      label = customLabel || 'Unpaid';
      bg = '#FEE2E2';
      color = '#B91C1C';
      break;
    case 'paid':
      label = customLabel || 'Paid';
      bg = '#DCFCE7';
      color = '#15803D';
      break;
    case 'waived':
      label = customLabel || 'Waived';
      bg = '#EDE9FE';
      color = '#6D28D9';
      break;

    // Member Statuses
    case 'suspended':
      label = customLabel || 'Suspended';
      bg = '#FEE2E2';
      color = '#991B1B';
      break;

    default:
      break;
  }

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.72rem' : '0.8rem',
        borderRadius: '16px',
        height: size === 'small' ? 22 : 26,
        letterSpacing: '0.02em',
        fontFamily: '"Hanken Grotesk", sans-serif',
        ...sx,
      }}
    />
  );
};

export default StatusBadge;
