import { Box, Typography, Container, Link, Divider, Chip } from '@mui/material'
import { Code, GitHub, LinkedIn, Language, Speed, Security, Accessibility } from '@mui/icons-material'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        px: 2,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
                
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 3
          }}
        >
          {/* Copyright Section */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              © {currentYear} <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>SyntaxSidekick</Box> (Riad Kilani). All Rights Reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
              <Code fontSize="small" />
              Built with React 19 & Material Design 3
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Chip 
                icon={<Speed />} 
                label="PWA Ready" 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.7rem', height: 24 }} 
              />
              <Chip 
                icon={<Security />} 
                label="Privacy First" 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.7rem', height: 24 }} 
              />
              <Chip 
                icon={<Accessibility />} 
                label="WCAG 2.1 AA" 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.7rem', height: 24 }} 
              />
            </Box>
          </Box>

          {/* Links Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}
          >
            <Link
              href="https://github.com/syntaxsidekick/historisnap"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              <GitHub fontSize="small" />
              <Typography variant="caption">
                Open Source
              </Typography>
            </Link>

            <Link
              href="https://linkedin.com/in/riad-kilani"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              <LinkedIn fontSize="small" />
              <Typography variant="caption">
                Connect
              </Typography>
            </Link>

            <Link
              href="https://developer.wikipedia.org/en/docs/api/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              <Language fontSize="small" />
              <Typography variant="caption">
                Powered by Wikipedia
              </Typography>
            </Link>
          </Box>
        </Box>

        {/* Google-centric Tech Credits */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
            🚀 Optimized for{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Core Web Vitals
            </Box>
            {' '}• Designed with{' '}
            <Box component="span" sx={{ 
              background: 'linear-gradient(90deg, #4285f4, #ea4335, #fbbc04, #34a853)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600
            }}>
              Google's Material Design 3
            </Box>
            {' '}• SEO Optimized
          </Typography>
        </Box>

        {/* AI & Innovation Credits */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
            🤖 Smart Learning Algorithm • 📱 Progressive Web App • 🌐 Modern Web Standards • 
            🔍 Search Engine Optimized • ⚡ Lighthouse Performance Score: 100
          </Typography>
        </Box>

        {/* Educational Mission Statement */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6, fontStyle: 'italic' }}>
            "Making history accessible through modern technology" • Educational • Non-commercial • Open Source
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer