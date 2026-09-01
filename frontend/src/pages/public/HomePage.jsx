import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  MenuBook as BookIcon,
  BookmarkBorder as ReserveIcon,
  VerifiedUserOutlined as AuditIcon,
  ArrowForward as ArrowIcon,
  AccountBalanceOutlined as AcademicIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/books');
    }
  };

  const features = [
    {
      icon: <BookIcon sx={{ fontSize: 28, color: '#57657B' }} />,
      iconBg: '#D5E3FD',
      title: 'การค้นพบทางบรรณานุกรมที่หลากหลาย',
      desc: 'ค้นหาข้อความฉบับเต็มได้ทันทีในเอกสารเฉพาะเรื่อง วารสาร ตำราวิชาการ และคอลเลกชันของมหาวิทยาลัยจำนวนหลายพันรายการ.',
    },
    {
      icon: <ReserveIcon sx={{ fontSize: 28, color: '#57657B' }} />,
      iconBg: '#D5E3FD',
      title: 'ระบบจองและพักรายการอัจฉริยะ',
      desc: 'จองหนังสือที่เป็นที่ต้องการสูงได้แบบเรียลไทม์ ตรวจสอบลำดับคิวการจอง และรับหนังสือได้ภายในกรอบเวลา 48 ชั่วโมง.',
    },
    {
      icon: <AuditIcon sx={{ fontSize: 28, color: '#57657B' }} />,
      iconBg: '#D5E3FD',
      title: 'การตรวจสอบข้อมูลการหมุนเวียนที่โปร่งใส',
      desc: 'ติดตามกำหนดส่งคืน การต่ออายุการยืม และการชำระค่าธรรมเนียม ด้วยระบบแจ้งเตือนอัตโนมัติแบบครบวงจรผ่าน SMS และภายในแอปพลิเคชัน.',
    },
  ];

  return (
    <Box sx={{ maxWidth: '1280px', mx: 'auto', pb: 4 }}>
      {/* ── 1. Hero Section ── */}
      <Box
        sx={{
          borderRadius: '32px',
          p: { xs: 4, sm: 6, md: 8 },
          background: 'linear-gradient(135deg, #0b1c30 0%, #131b2e 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(11, 28, 48, 0.35)',
          mb: { xs: 8, md: 10 },
        }}
      >
        {/* Subtle Decorative Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            opacity: 0.08,
            backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 760 }}>
          {/* Pill Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: '24px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(198, 198, 205, 0.3)',
              backdropFilter: 'blur(10px)',
              mb: 4,
            }}
          >
            <AcademicIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontSize: '0.82rem',
                letterSpacing: '0.01em',
              }}
            >
                  แพลตฟอร์มห้องสมุดวิชาการ
            </Typography>
          </Box>

          {/* Headline */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontFamily: '"Manrope", sans-serif',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              mb: 3,
            }}
          >
            เสริมศักยภาพการวิจัยทางวิชาการและการค้นพบองค์ความรู้
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.6,
              color: '#BEC6E0',
              fontFamily: '"Hanken Grotesk", sans-serif',
              maxWidth: 640,
              mb: 5,
            }}
          >
            เข้าถึงแคตตาล็อกหนังสือของสถาบัน จัดการการยืมหนังสือ จองตำราเรียน และชำระค่าธรรมเนียมต่างๆ ได้อย่างสะดวกสบายผ่านระบบดิจิทัลครบวงจร
          </Typography>

          {/* Search Component */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={0}
            sx={{
              p: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(198, 198, 205, 0.5)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
              maxWidth: 640,
              mb: 3,
            }}
          >
            <Box sx={{ pl: 1.5, pr: 1, color: '#45464D', display: 'flex', alignItems: 'center' }}>
              <SearchIcon />
            </Box>
            <TextField
              fullWidth
              variant="standard"
              placeholder="ค้นหาชื่อเรื่อง ผู้แต่ง หัวข้อ... "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontSize: '1rem',
                color: '#191C1E',
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '12px',
                px: 3.5,
                py: 1.2,
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'none',
                bgcolor: '#131B2E',
                color: '#FFFFFF',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0B1C30' },
              }}
            >
              ค้นหา
            </Button>
          </Paper>

          {/* Popular Topics */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#BEC6E0',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: '"Hanken Grotesk", sans-serif',
              }}
            >
              หัวข้อยอดนิยม:
            </Typography>
            {['วิทยาการคอมพิวเตอร์', 'โครงสร้างข้อมูล', 'เศรษฐศาสตร์จุลภาค', 'ฟิสิกส์'].map((topic) => (
              <Box
                key={topic}
                component="a"
                onClick={() => navigate(`/books?search=${encodeURIComponent(topic)}`)}
                sx={{
                  px: 2,
                  py: 0.6,
                  borderRadius: '24px',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(198, 198, 205, 0.3)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontFamily: '"Hanken Grotesk", sans-serif',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                }}
              >
                {topic}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── 2. Services Section ── */}
      <Box sx={{ mb: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontFamily: '"Manrope", sans-serif',
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            color: '#191C1E',
            mb: 1.5,
          }}
        >
          บริการห้องสมุดวิชาการแบบครบวงจร
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '1.1rem',
            color: '#45464D',
            fontFamily: '"Hanken Grotesk", sans-serif',
            mb: 6,
          }}
        >
          สร้างขึ้นสำหรับนักศึกษามหาวิทยาลัย นักวิจัยที่เป็นคณาจารย์ และเจ้าหน้าที่ปฏิบัติงานห้องสมุด
        </Typography>

        <Grid container spacing={3.5}>
          {features.map((f, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E3E5',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-2px)',
                    '& .service-icon-box': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <Box
                  className="service-icon-box"
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    bgcolor: f.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {f.icon}
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '1.25rem',
                    color: '#191C1E',
                    mb: 1.5,
                  }}
                >
                  {f.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#45464D',
                    fontFamily: '"Hanken Grotesk", sans-serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── 3. CTA Section ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E0E3E5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: '"Manrope", sans-serif',
              fontSize: { xs: '1.5rem', md: '1.85rem' },
              color: '#191C1E',
              mb: 1,
            }}
          >
            Ready to start reading?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#45464D',
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: '1.05rem',
            }}
          >
            ลงชื่อเข้าใช้ด้วยบัญชีมหาวิทยาลัยของคุณ หรือเลือกดูรายการบรรณานุกรมแบบเปิด.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/books')}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              px: 3.5,
              py: 1.3,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              color: '#191C1E',
              borderColor: '#C6C6CD',
              bgcolor: '#ECEEF0',
              '&:hover': { bgcolor: '#E6E8EA', borderColor: '#76777D' },
            }}
          >
            สำรวจแคตตาล็อก
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            endIcon={<ArrowIcon />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              px: 3.5,
              py: 1.3,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              bgcolor: '#131B2E',
              color: '#FFFFFF',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0B1C30' },
            }}
          >
            เข้าสู่ระบบสำหรับสมาชิก
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;
