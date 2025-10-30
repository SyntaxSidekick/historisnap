import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Paper
} from '@mui/material'
import {
  History as HistoryIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import { getRecentEventsStats, clearRecentEvents } from '../services/recentEventsTracker'

const RecentEventsIndicator = () => {
  const [expanded, setExpanded] = useState(false)
  const [stats, setStats] = useState({})

  const updateStats = () => {
    const trendingStats = getRecentEventsStats('trending')
    const randomStats = getRecentEventsStats('random')
    
    setStats({
      trending: trendingStats,
      random: randomStats,
      totalEvents: trendingStats.totalTracked + randomStats.totalTracked
    })
  }

  useEffect(() => {
    updateStats()
    // Update stats when storage changes
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('historisnap_recent_')) {
        updateStats()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also update on focus (for same-tab changes)
    const handleFocus = () => updateStats()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleClearHistory = (type) => {
    clearRecentEvents(type)
    updateStats()
  }

  if (stats.totalEvents === 0) return null

  return (
    <Paper
      elevation={1}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        maxWidth: 300,
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 1000,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ fontSize: '20px' }} />
          <Typography variant="body2" fontWeight="600">
            Recent Events ({stats.totalEvents})
          </Typography>
        </Box>
        
        <IconButton 
          size="small" 
          sx={{ color: 'inherit' }}
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            🎯 Avoiding repetition for better variety
          </Typography>

          {/* Trending Events */}
          {stats.trending?.totalTracked > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="600">
                  Trending History ({stats.trending.totalTracked})
                </Typography>
                <Tooltip title="Clear trending history">
                  <IconButton 
                    size="small" 
                    onClick={() => handleClearHistory('trending')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <ClearIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {stats.trending.recentTitles?.slice(0, 3).map((title, index) => (
                  <Chip 
                    key={index}
                    label={title?.length > 20 ? title.substring(0, 20) + '...' : title}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '11px' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Random Events */}
          {stats.random?.totalTracked > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="600">
                  Random Events ({stats.random.totalTracked})
                </Typography>
                <Tooltip title="Clear random history">
                  <IconButton 
                    size="small" 
                    onClick={() => handleClearHistory('random')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <ClearIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {stats.random.recentTitles?.slice(0, 3).map((title, index) => (
                  <Chip 
                    key={index}
                    label={title?.length > 20 ? title.substring(0, 20) + '...' : title}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '11px' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Events reset automatically after 24 hours
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default RecentEventsIndicator