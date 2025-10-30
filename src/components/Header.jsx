import { AppBar, Toolbar, Typography, Box, Tooltip } from '@mui/material'
import { History, LightMode, DarkMode } from '@mui/icons-material'
import { useTheme } from '../hooks/useTheme'

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0}
      className="app-header"
    >
      <div className="header-content">
        <div className="logo-section">
          <History 
            className="logo-icon" 
            sx={{ color: 'primary.main' }}
          />
          <Typography 
            variant="h4" 
            component="h1"
            className="logo-text"
            sx={{ color: 'text.primary' }}
          >
            HistoriSnap
          </Typography>
        </div>
        
        <Typography 
          variant="body1" 
          className="tagline"
          sx={{ 
            color: 'text.secondary',
            display: { xs: 'none', sm: 'block' }, // Hide on mobile, show on sm and up
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }}
        >
          Discover history, one moment at a time
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip 
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`} 
            placement="bottom" 
            arrow
          >
            <Box
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
              sx={{
                position: 'relative',
                width: 44,
                height: 24,
                backgroundColor: isDarkMode ? 'primary.main' : 'grey.300',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0, // Prevent toggle from shrinking on mobile
                '&:hover': {
                  backgroundColor: isDarkMode ? 'primary.dark' : 'grey.400',
                  transform: 'scale(1.02)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&:focus': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleTheme()
                }
              }}
            >
              {/* Toggle Switch Handle */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '2px',
                  left: isDarkMode ? '22px' : '2px',
                  width: 20,
                  height: 20,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  '& .MuiSvgIcon-root': {
                    fontSize: '12px',
                    color: isDarkMode ? 'primary.main' : 'grey.600',
                    transition: 'color 0.2s ease',
                  }
                }}
              >
                {isDarkMode ? <DarkMode /> : <LightMode />}
              </Box>
            </Box>
          </Tooltip>
        </Box>
      </div>
    </AppBar>
  )
}

export default Header