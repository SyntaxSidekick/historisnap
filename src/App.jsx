import { useState, useCallback, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { CustomThemeProvider } from './contexts/ThemeContext'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import Controls from './components/Controls'
import EventDisplay from './components/EventDisplay'
import RecentEventsIndicator from './components/RecentEventsIndicator'
import Footer from './components/Footer'
import { Container } from '@mui/material'
import { fetchEventsForDate, fetchRandomEvent, getAllLocalEvents, searchHistoricalEvents, searchEventsByCategory, searchTrendingEvents, fetchThisDayInHistory, trackEventClick } from './services/historicalEventsAPI'
import './styles/main.scss'

function AppContent() {
  const { theme } = useTheme()
  const [currentEvent, setCurrentEvent] = useState(() => {
    // Initialize with MTV event from local data
    const localEvents = getAllLocalEvents()
    return localEvents.find(event => event.id === 0) || null
  })
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')
  const [eventStartTime, setEventStartTime] = useState(Date.now())

  // Track event clicks for learning
  const handleEventClick = useCallback((event) => {
    if (currentSearchQuery && event) {
      const timeSpent = Date.now() - eventStartTime
      trackEventClick(
        currentSearchQuery,
        event.id,
        event.title,
        event.categories || [],
        timeSpent
      )
      console.log(`📊 Tracked click: ${event.title} from search "${currentSearchQuery}"`)
    }
  }, [currentSearchQuery, eventStartTime])

  const handleEventGeneration = useCallback(async (filterCriteria = {}) => {
    setLoading(true)
    setEventStartTime(Date.now()) // Track when user starts viewing results
    
    try {
      // Handle text search queries
      if (filterCriteria.searchQuery && filterCriteria.searchType === 'text') {
        console.log(`Searching for: "${filterCriteria.searchQuery}"`)
        setCurrentSearchQuery(filterCriteria.searchQuery) // Track current query
        
        const searchResults = await searchHistoricalEvents(filterCriteria.searchQuery)
        
        if (searchResults.length > 0) {
          const randomResult = searchResults[Math.floor(Math.random() * searchResults.length)]
          setCurrentEvent(randomResult)
        } else {
          // Fallback to random event
          const randomEvent = await fetchRandomEvent()
          setCurrentEvent(randomEvent)
        }
      }
      // Handle category searches
      else if (filterCriteria.category && filterCriteria.searchType === 'category') {
        console.log(`Searching for category: "${filterCriteria.category}"`)
        setCurrentSearchQuery(filterCriteria.category) // Track category as search query
        
        const categoryResults = await searchEventsByCategory(filterCriteria.category)
        
        if (categoryResults.length > 0) {
          const randomResult = categoryResults[Math.floor(Math.random() * categoryResults.length)]
          setCurrentEvent(randomResult)
        } else {
          // Fallback to random event
          const randomEvent = await fetchRandomEvent()
          setCurrentEvent(randomEvent)
        }
      }
      // Handle trending searches
      else if (filterCriteria.searchType === 'trending') {
        console.log('Searching for trending historical events...')
        const trendingResults = await searchTrendingEvents()
        
        if (trendingResults.length > 0) {
          const randomResult = trendingResults[Math.floor(Math.random() * trendingResults.length)]
          setCurrentEvent(randomResult)
        } else {
          // Fallback to random event
          const randomEvent = await fetchRandomEvent()
          setCurrentEvent(randomEvent)
        }
      }
      // Handle "This Day in History" requests
      else if (filterCriteria.searchType === 'thisday') {
        console.log('Fetching This Day in History...')
        const thisDayEvent = await fetchThisDayInHistory()
        setCurrentEvent(thisDayEvent)
      }
      // Handle date-based searches
      else if (filterCriteria.year || filterCriteria.month || filterCriteria.day) {
        // Fetch events for specific date from multiple APIs, passing the user's selected year
        const events = await fetchEventsForDate(filterCriteria.month, filterCriteria.day, filterCriteria.year)
        
        let filteredEvents = events
        
        if (filterCriteria.year) {
          // Try to find events matching the specific year
          filteredEvents = events.filter(event => event.year === filterCriteria.year)
          
          // If no exact year match, show all events for that date but with user's selected year in display
          if (filteredEvents.length === 0) {
            filteredEvents = events
          }
        }
        
        if (filteredEvents.length > 0) {
          const randomEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)]
          setCurrentEvent(randomEvent)
        } else {
          // Last resort: return a random local event
          const localEvents = getAllLocalEvents()
          const randomEvent = localEvents[Math.floor(Math.random() * localEvents.length)]
          setCurrentEvent(randomEvent)
        }
      } else {
        // Get general events (fallback to local)
        const localEvents = getAllLocalEvents()
        const randomEvent = localEvents[Math.floor(Math.random() * localEvents.length)]
        setCurrentEvent(randomEvent)
      }
    } catch (error) {
      console.error('Error generating event:', error)
      // Fallback to local events
      const localEvents = getAllLocalEvents()
      const randomEvent = localEvents[Math.floor(Math.random() * localEvents.length)]
      setCurrentEvent(randomEvent)
    }
    
    setLoading(false)
  }, [])

  const handleRandomEvent = useCallback(async () => {
    setLoading(true)
    
    try {
      const randomEvent = await fetchRandomEvent()
      setCurrentEvent(randomEvent)
      setSelectedDate(null) // Clear date picker
    } catch (error) {
      console.error('Error fetching random event:', error)
      // Fallback to local events
      const localEvents = getAllLocalEvents()
      const randomEvent = localEvents[Math.floor(Math.random() * localEvents.length)]
      setCurrentEvent(randomEvent)
      setSelectedDate(null)
    }
    
    setLoading(false)
  }, [])

  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate)
  }, [])

  // Memoize the theme provider content to prevent unnecessary re-renders
  const themeProviderContent = useMemo(() => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main className="main-container" style={{ flex: 1 }}>
            <Controls 
              onGenerateEvent={handleEventGeneration}
              onRandomEvent={handleRandomEvent}
              loading={loading}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
            <EventDisplay 
              event={currentEvent}
              loading={loading}
              onEventClick={handleEventClick}
            />
          </main>
          <RecentEventsIndicator />
          <Footer />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  ), [theme, handleEventGeneration, handleRandomEvent, loading, selectedDate, handleDateChange, currentEvent, handleEventClick])

  return themeProviderContent
}

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  )
}

export default App
