import { createTheme } from '@mui/material/styles';

/**
 * Aura Academic SaaS Design System Theme
 * Online Library Management System
 * Optimized for English & Thai Bilingual Typography
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB', // Academic Royal Blue
      light: '#EFF6FF',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F2942', // Deep Academic Navy
      light: '#1E3A5F',
      dark: '#0A192F',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0284C7',
      light: '#E0F2FE',
      dark: '#0369A1',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#515F74',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: [
      'Manrope',
      'Outfit',
      'Hanken Grotesk',
      'Inter',
      'Prompt',
      'Sarabun',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"Manrope", "Outfit", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: '"Manrope", "Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Manrope", "Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontFamily: '"Manrope", "Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Manrope", "Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Manrope", "Outfit", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Hanken Grotesk", "Inter", sans-serif',
      fontWeight: 600,
    },
    subtitle2: {
      fontFamily: '"Hanken Grotesk", "Inter", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Hanken Grotesk", "Inter", sans-serif',
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Hanken Grotesk", "Inter", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Hanken Grotesk", "Inter", sans-serif',
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    '0 10px 25px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
    '0 12px 30px -4px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.03)',
    '0 20px 40px -8px rgba(15, 23, 42, 0.12)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    ...Array(17).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 0.18s ease',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 16,
          fontFamily: '"Hanken Grotesk", sans-serif',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          color: '#475569',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          borderBottom: '1px solid #E2E8F0',
        },
        root: {
          borderBottom: '1px solid #F1F5F9',
          fontFamily: '"Hanken Grotesk", sans-serif',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2563EB',
            borderWidth: 1.5,
          },
        },
      },
    },
  },
});

export default theme;
