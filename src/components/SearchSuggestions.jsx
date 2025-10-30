import { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Typography,
  Chip,
  Divider
} from '@mui/material'
import { 
  Search as SearchIcon, 
  TrendingUp as TrendingIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
  AutoAwesome as SmartIcon
} from '@mui/icons-material'
import { getSearchSuggestions } from '../services/historicalEventsAPI'

const SearchSuggestions = ({ 
  query, 
  onSuggestionClick, 
  visible
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const suggestionTimeoutRef = useRef(null)

  useEffect(() => {
    // Clear previous timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current)
    }

    // Only fetch suggestions if query is long enough and visible
    if (query.length < 2 || !visible) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Debounce suggestion fetching
    suggestionTimeoutRef.current = setTimeout(() => {
      try {
        const newSuggestions = getSearchSuggestions(query, 6)
        setSuggestions(newSuggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
    }
  }, [query, visible])

  if (!visible || (!isLoading && suggestions.length === 0)) {
    return null
  }

  const getSuggestionIcon = (suggestion) => {
    switch (suggestion.type) {
      case 'popular':
        return <TrendingIcon color="primary" fontSize="small" />
      case 'category':
        return <CategoryIcon color="secondary" fontSize="small" />
      case 'recent':
        return <HistoryIcon color="action" fontSize="small" />
      default:
        return <SearchIcon color="action" fontSize="small" />
    }
  }

  const getSuggestionLabel = (suggestion) => {
    switch (suggestion.type) {
      case 'popular':
        return `Popular (${suggestion.count || 0} searches)`
      case 'category':
        return suggestion.reason || 'Based on your interests'
      case 'recent':
        return 'Recent search'
      default:
        return 'Suggestion'
    }
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1300,
        maxHeight: '300px',
        overflow: 'auto',
        mt: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      {isLoading ? (
        <Box p={2} display="flex" alignItems="center" gap={1}>
          <SmartIcon color="primary" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Getting smart suggestions...
          </Typography>
        </Box>
      ) : (
        <>
          <Box p={1.5} pb={1}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              <SmartIcon fontSize="small" />
              Smart Suggestions
            </Typography>
          </Box>
          
          <Divider />
          
          <List dense sx={{ py: 0 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={`${suggestion.query}-${index}`}
                button
                onClick={() => onSuggestionClick(suggestion.query)}
                sx={{
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getSuggestionIcon(suggestion)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: suggestion.type === 'popular' ? 600 : 400 
                        }}
                      >
                        {suggestion.query}
                      </Typography>
                      
                      {suggestion.type === 'popular' && (
                        <Chip 
                          label="Popular" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ 
                            height: 18, 
                            fontSize: '0.7rem',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                      
                      {suggestion.type === 'category' && (
                        <Chip 
                          label="Interest" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ 
                            height: 18, 
                            fontSize: '0.7rem',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {getSuggestionLabel(suggestion)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          {suggestions.length > 0 && (
            <>
              <Divider />
              <Box p={1} display="flex" justifyContent="center">
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  Suggestions improve as you search more
                </Typography>
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  )
}

export default SearchSuggestions