import { 
  Box, 
  Button, 
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Fab,
  Tooltip,
  Divider,
  Typography,
  Modal,
  Backdrop
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { 
  Search, 
  Shuffle, 
  CalendarToday,
  TrendingUp,
  AutoAwesome,
  AccessTime,
  Public,
  Science,
  Clear
} from '@mui/icons-material'
import dayjs from 'dayjs'
import { useState } from 'react'
import SearchSuggestions from './SearchSuggestions'

const Controls = ({ onGenerateEvent, onRandomEvent, loading, selectedDate, onDateChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const predefinedFilters = [
    { label: 'This Day in History', icon: <AccessTime />, action: () => handleTodayInHistory() },
    { label: 'Science & Discovery', icon: <Science />, category: 'Science' },
    { label: 'World Events', icon: <Public />, category: 'Politics' },
    { label: 'Trending Historical', icon: <TrendingUp />, action: () => handleTrending() }
  ]

  const handleDateChange = (newDate) => {
    onDateChange(newDate)
    setShowDatePicker(false)
    
    // Auto-trigger event discovery when date is selected
    if (newDate) {
      const date = dayjs(newDate)
      onGenerateEvent({
        year: date.year(),
        month: date.month() + 1, // dayjs months are 0-based
        day: date.date()
      })
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Search for events related to the query
      onGenerateEvent({ 
        searchQuery: searchQuery.trim(),
        searchType: 'text'
      })
    } else if (selectedDate) {
      // Fallback to date search
      const date = dayjs(selectedDate)
      onGenerateEvent({
        year: date.year(),
        month: date.month() + 1,
        day: date.date()
      })
    } else {
      // Random search
      onGenerateEvent()
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDiscoverClick = (customQuery = null) => {
    const queryToUse = customQuery || searchQuery.trim()
    
    if (queryToUse) {
      // Search for events related to the query
      onGenerateEvent({ 
        searchQuery: queryToUse,
        searchType: 'text'
      })
    } else if (selectedDate) {
      // Fallback to date search
      const date = dayjs(selectedDate)
      onGenerateEvent({
        year: date.year(),
        month: date.month() + 1,
        day: date.date()
      })
    } else {
      // Random search
      onGenerateEvent()
    }
  }

  const handleTodayInHistory = () => {
    const today = dayjs()
    onDateChange(today)
    onGenerateEvent({
      year: today.year(),
      month: today.month() + 1,
      day: today.date(),
      searchType: 'thisday' // Add a special flag for this day in history
    })
  }

  const handleTrending = () => {
    // Generate trending historical events based on current relevance, anniversaries, and popular topics
    onGenerateEvent({ 
      searchType: 'trending'
    })
  }

  const handleFilterChip = (filter) => {
    if (filter.action) {
      filter.action()
    } else if (filter.category) {
      // Search for events in specific category
      onGenerateEvent({ 
        category: filter.category,
        searchType: 'category'
      })
    }
  }

  const clearDate = () => {
    onDateChange(null)
  }

  // Quick historical dates
  const quickDates = [
    { label: 'Moon Landing', date: dayjs('1969-07-20') },
    { label: 'Berlin Wall Fall', date: dayjs('1989-11-09') },
    { label: 'Independence Day', date: dayjs('1776-07-04') },
    { label: 'Pearl Harbor', date: dayjs('1941-12-07') },
  ]

  const handleQuickDate = (date) => {
    handleDateChange(date)
    setShowDatePicker(false)
  }

  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: 800, 
        mx: 'auto', 
        mb: 4,
        px: 2
      }}
    >
      {/* Main Search Bar */}
      <Paper
        elevation={3}
        sx={{
          p: 1,
          borderRadius: 8,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 6,
            borderColor: 'primary.main'
          },
          '&:focus-within': {
            boxShadow: 6,
            borderColor: 'primary.main'
          }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Search Icon */}
          <IconButton 
            size="medium" 
            disabled={loading}
            onClick={handleDiscoverClick}
            sx={{ 
              color: loading ? 'action.disabled' : 'primary.main',
              '&:hover': { backgroundColor: 'primary.50' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : <Search />}
          </IconButton>
          
          {/* Date Display/Input */}
          <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
            {selectedDate ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={dayjs(selectedDate).format('MMMM D, YYYY')}
                  onDelete={clearDate}
                  deleteIcon={<Clear />}
                  variant="outlined"
                  color="primary"
                  sx={{ 
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      px: 2,
                      fontWeight: 500
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  Explore this date
                </Typography>
              </Stack>
            ) : (
              <>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Search history by date or discover what happened..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(e.target.value.length >= 2)
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow suggestion clicks
                  InputProps={{
                    disableUnderline: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Select Date">
                          <IconButton 
                            onClick={() => setShowDatePicker(true)}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                          >
                            <CalendarToday />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiInput-input': {
                      fontSize: '16px',
                      fontWeight: 400,
                      py: 1.5,
                      px: 1
                    }
                  }}
                />
                
                {/* Smart Suggestions */}
                <SearchSuggestions
                  query={searchQuery}
                  visible={showSuggestions && !loading}
                  onSuggestionClick={(suggestion) => {
                    setSearchQuery(suggestion)
                    setShowSuggestions(false)
                    handleDiscoverClick(suggestion)
                  }}
                />
              </>
            )}
          </Box>
          
          {/* Random Event Button */}
          <Tooltip title="Surprise me!">
            <IconButton 
              onClick={onRandomEvent}
              disabled={loading}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: 'action.hover',
                  color: 'primary.main'
                }
              }}
            >
              <AutoAwesome />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Quick Action Chips */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          mt: 2, 
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center'
        }}
      >
        {predefinedFilters.map((filter, index) => (
          <Chip
            key={index}
            label={filter.label}
            icon={filter.icon}
            onClick={() => handleFilterChip(filter)}
            disabled={loading}
            variant="outlined"
            size="medium"
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'primary.50',
                borderColor: 'primary.main',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          />
        ))}
      </Stack>

      {/* Floating Action Button for Random */}
      <Fab
        color="primary"
        size="large"
        onClick={onRandomEvent}
        disabled={loading}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: 4,
          '&:hover': {
            boxShadow: 8,
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Shuffle />
      </Fab>

      {/* Date Picker Modal */}
      <Modal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            minWidth: 350,
            maxWidth: '90vw',
            outline: 'none',
            boxShadow: 24
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Select Historical Date
          </Typography>

          {/* Quick Date Options */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Popular Historical Dates:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            {quickDates.map((quickDate, index) => (
              <Chip
                key={index}
                label={quickDate.label}
                size="small"
                variant="outlined"
                onClick={() => handleQuickDate(quickDate.date)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    borderColor: 'primary.main'
                  }
                }}
              />
            ))}
          </Stack>
          
          <DatePicker
            label="Or choose your own date"
            value={selectedDate}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'medium',
                variant: 'outlined'
              }
            }}
            sx={{ mb: 2 }}
          />
          
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined"
              onClick={() => setShowDatePicker(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                if (selectedDate) {
                  handleDateChange(selectedDate)
                }
                setShowDatePicker(false)
              }}
              disabled={!selectedDate}
            >
              Explore Date
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}

export default Controls