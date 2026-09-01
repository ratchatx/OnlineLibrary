import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Fade,
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
  ArrowBack as BackIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import libraryBg from '../../assets/images/library_login_bg.jpg';

/* ── Custom Architectural Library Logo ────────────────── */
const LibraryBrandLogo = () => (
  <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pediment / Roof */}
    <path
      d="M24 6L6 15H42L24 6Z"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(255, 255, 255, 0.15)"
    />
    {/* Roof baseline */}
    <line x1="4" y1="17" x2="44" y2="17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    {/* Columns */}
    <line x1="9" y1="18" x2="9" y2="34" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="39" y1="18" x2="39" y2="34" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    {/* Open Book in Center */}
    <path
      d="M24 22V35M24 22C21.5 20 17 20 14 21.5V34C17 32.5 21.5 32.5 24 34.5M24 22C26.5 20 31 20 34 21.5V34C31 32.5 26.5 32.5 24 34.5"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Base platform */}
    <line x1="4" y1="36" x2="44" y2="36" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="2" y1="40" x2="46" y2="40" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ── Main LoginPage Component ─────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Quick Preset Helper for testing
  const handleQuickLogin = (presetUser, presetPass) => {
    setUsername(presetUser);
    setPassword(presetPass);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('กรุณากรอก Email/Username และ Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(username.trim(), password);

      const redirectUrl = new URLSearchParams(location.search).get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (user.role === 'admin' || user.role === 'librarian') {
        navigate('/staff/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* ── Left Hero Panel (Illustration & Branding) ── */}
      <Box
        sx={{
          flex: { xs: 'none', md: '1 1 54%' },
          height: { xs: '260px', sm: '320px', md: '100vh' },
          position: 'relative',
          backgroundImage: `url(${libraryBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 3, sm: 4, md: 6 },
          color: '#FFFFFF',
        }}
      >
        {/* Subtle Gradient Overlays for High Legibility */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(15, 23, 42, 0.48) 0%, rgba(15, 23, 42, 0.08) 45%, rgba(15, 23, 42, 0.35) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top-Left Brand Logo & Title Overlay */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))',
            }}
          >
            <LibraryBrandLogo />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                lineHeight: 1.15,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                fontFamily: '"Outfit", "Inter", sans-serif',
              }}
            >
              ONLINE LIBRARY
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem' },
                lineHeight: 1.15,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                fontFamily: '"Outfit", "Inter", sans-serif',
              }}
            >
              MANAGEMENT SYSTEM
            </Typography>
          </Box>
        </Box>

        {/* Bottom Left Navigation Link */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/')}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(8px)',
              px: 2.5,
              py: 0.8,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(15, 23, 42, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
            }}
          >
            กลับสู่หน้าหลักห้องสมุด
          </Button>
        </Box>
      </Box>

      {/* ── Right Form Panel (Clean & Floating Card) ── */}
      <Box
        sx={{
          flex: { xs: '1 1 auto', md: '1 1 46%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4, md: 6 },
          bgcolor: '#FFFFFF',
          minHeight: { xs: 'auto', md: '100vh' },
        }}
      >
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 430,
              p: { xs: 3.5, sm: 5 },
              borderRadius: '24px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow:
                '0 20px 50px -10px rgba(37, 99, 235, 0.1), 0 4px 16px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Form Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#2563EB',
                textAlign: 'center',
                mb: 3.5,
                letterSpacing: '0.04em',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontSize: { xs: '1.75rem', sm: '2rem' },
              }}
            >
              LOGIN
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: 3,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} noValidate>
              {/* Field 1: Email / Username */}
              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth
                  placeholder="Email / Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  id="login-username-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#64748B', ml: 0.5, fontSize: '1.35rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '30px',
                      height: '52px',
                      bgcolor: '#FFFFFF',
                      px: 1.5,
                      fontSize: '0.95rem',
                      '& fieldset': {
                        borderColor: '#CBD5E1',
                        borderWidth: '1.5px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#94A3B8',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563EB',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </Box>

              {/* Field 2: Password */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  id="login-password-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#64748B', ml: 0.5, fontSize: '1.35rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748B', mr: 0.5 }}
                          id="toggle-password-visibility"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '30px',
                      height: '52px',
                      bgcolor: '#FFFFFF',
                      px: 1.5,
                      fontSize: '0.95rem',
                      '& fieldset': {
                        borderColor: '#CBD5E1',
                        borderWidth: '1.5px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#94A3B8',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563EB',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </Box>

              {/* Options Row: Remember Me & Forgot Password */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  px: 0.5,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: '#94A3B8',
                        '&.Mui-checked': {
                          color: '#2563EB',
                        },
                      }}
                      id="remember-me-checkbox"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#334155',
                      }}
                    >
                      Remember Me
                    </Typography>
                  }
                />

                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setForgotOpen(true)}
                  sx={{
                    color: '#2563EB',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  id="forgot-password-link"
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                id="login-submit-btn"
                sx={{
                  height: '50px',
                  borderRadius: '30px',
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#1D4ED8',
                    boxShadow: '0 8px 22px rgba(37, 99, 235, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'LOGIN'
                )}
              </Button>
            </Box>

            {/* Quick Demo Test Accounts Drawer / Toggle */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => setShowPresets(!showPresets)}
                startIcon={<HelpIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'none',
                }}
              >
                {showPresets ? 'ซ่อนบัญชีทดสอบ' : 'บัญชีทดสอบด่วน (Quick Demo Accounts)'}
              </Button>

              {showPresets && (
                <Box
                  sx={{
                    mt: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.8,
                    p: 1.5,
                    bgcolor: '#F8FAFC',
                    borderRadius: 2.5,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    คลิกเพื่อกรอกข้อมูลเข้าสู่ระบบ:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label="Admin"
                      size="small"
                      color="secondary"
                      onClick={() => handleQuickLogin('admin', 'Admin@1234')}
                      sx={{ fontWeight: 700, cursor: 'pointer' }}
                    />
                    <Chip
                      label="Librarian"
                      size="small"
                      color="primary"
                      onClick={() => handleQuickLogin('librarian01', 'Lib@1234')}
                      sx={{ fontWeight: 700, cursor: 'pointer' }}
                    />
                    <Chip
                      label="Member"
                      size="small"
                      onClick={() => handleQuickLogin('member01', 'Member@1234')}
                      sx={{ fontWeight: 700, cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Fade>
      </Box>

      {/* ── Forgot Password Dialog ── */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#2563EB' }}>
          ลืมรหัสผ่าน (Forgot Password)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            กรุณาติดต่อเจ้าหน้าที่บรรณารักษ์หรือผู้ดูแลระบบที่เคาน์เตอร์บริการห้องสมุดเพื่อทำการรีเซ็ตรหัสผ่านของคุณ
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: '#F0F9FF',
              borderRadius: 2,
              border: '1px solid #BAE6FD',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0369A1', display: 'block' }}>
              ติดต่อฝ่ายบริการห้องสมุด:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              อีเมล: library-support@university.ac.th<br />
              โทรศัพท์: 02-123-4567 ต่อ 101-103
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setForgotOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            เข้าใจแล้ว
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
