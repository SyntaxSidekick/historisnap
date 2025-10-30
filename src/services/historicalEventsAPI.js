// Historical Events API Service
// Uses multiple APIs for comprehensive historical data coverage

import { historicalEvents as localEvents } from '../data/historicalEvents.js'
import { getVerifiedImage } from './imageService.js'
import searchAnalytics from './searchAnalytics.js'
import { selectVariedEvent } from './recentEventsTracker.js'

const WIKIPEDIA_API_BASE = 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday'
const TODAY_IN_HISTORY_API_BASE = 'https://history.muffinlabs.com/date'
const NUMBERS_API_BASE = 'https://numbersapi.com'

// Performance configuration
const API_CONFIG = {
  timeout: 3000, // 3 second timeout
  maxRetries: 2,
  maxConcurrentRequests: 3, // Reduced from 5 to prevent overwhelming APIs
  cacheExpiry: 300000, // 5 minutes
  batchSize: 3, // Process API calls in batches
  imageValidationConcurrency: 2 // Limit concurrent image validations
}

// Simple in-memory cache with performance tracking
const cache = new Map()
const performanceMetrics = {
  apiHits: 0,
  cacheHits: 0,
  averageResponseTime: 0
}

// Request deduplication with batching support
const activeRequests = new Map()

// Helper function to create fetch with timeout
const fetchWithTimeout = async (url, timeout = API_CONFIG.timeout) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HistoriSnap/1.0'
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// Cache helpers with performance tracking
const getCacheKey = (type, ...params) => `${type}:${params.join(':')}`
const getCached = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheExpiry) {
    performanceMetrics.cacheHits++
    return cached.data
  }
  cache.delete(key)
  return null
}
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() })
  // Prevent memory leaks - limit cache size
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
}

// Batch processing for multiple API requests
const processBatch = async (requests, batchSize = API_CONFIG.batchSize) => {
  const results = []
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(batch)
    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean))
    
    // Small delay between batches to prevent rate limiting
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  return results
}

// Helper function to get bulletproof images using the new image service
// Optimized with request limiting to prevent overwhelming image validation
const getHistoricalImage = async (categories, originalUrl = null) => {
  try {
    // Add small delay for concurrent requests to prevent overwhelming validation
    if (activeRequests.size > API_CONFIG.imageValidationConcurrency) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    return await getVerifiedImage(categories, originalUrl)
  } catch (error) {
    console.error('Error getting verified image:', error)
    // Return base64 fallback as last resort
    return `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4gICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4gICAgPC9saW5lYXJHcmFkaWVudD4gIDwvZGVmcz4gIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+ICA8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGlzdG9yaWNhbCBFdmVudDwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+` 
  }
}

// Fetch Wikipedia image for an event
const fetchWikipediaImage = async (title, pageTitle = '') => {
  try {
    // Clean the title for search
    const searchTitle = pageTitle || title.replace(/[^\w\s]/g, '').trim()
    
    // Search for Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchTitle)}&limit=1&format=json&origin=*`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (searchData[1] && searchData[1][0]) {
      const pageTitle = searchData[1][0]
      
      // Get page images
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=800&origin=*`
      
      const imageResponse = await fetch(imageUrl)
      const imageData = await imageResponse.json()
      
      const pages = imageData.query?.pages
      if (pages) {
        const page = Object.values(pages)[0]
        if (page?.thumbnail?.source) {
          // Return Wikipedia image directly (they are generally reliable)
          const imageUrl = page.thumbnail.source
          
          // Basic URL validation - ensure it's a proper image URL
          if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
              imageUrl.includes('upload.wikimedia.org')) {
            return imageUrl
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching Wikipedia image:', error)
    return null
  }
}

// Helper function to categorize events based on text content with improved contextual matching
const categorizeEvent = (text, title) => {
  const content = (text + ' ' + title).toLowerCase()
  
  // SPECIFIC EVENT MATCHING (most contextual)
  // Berlin Wall and Cold War events
  if (content.includes('berlin wall') || content.includes('fall of berlin') || content.includes('iron curtain')) {
    return ['Freedom', 'Wall', 'ColdWar']
  }
  
  // 9/11 and terrorism
  if (content.includes('september 11') || content.includes('9/11') || content.includes('world trade center') || content.includes('twin towers')) {
    return ['Disaster', 'Terrorism', 'Memorial']
  }
  
  // Moon landing and space exploration
  if (content.includes('moon landing') || content.includes('apollo') || content.includes('neil armstrong') || content.includes('buzz aldrin')) {
    return ['Space', 'Moon', 'Achievement']
  }
  
  // World Wars
  if (content.includes('world war i') || content.includes('world war 1') || content.includes('wwi') || content.includes('great war')) {
    return ['War', 'WorldWar1', 'Military']
  }
  if (content.includes('world war ii') || content.includes('world war 2') || content.includes('wwii') || content.includes('nazi') || content.includes('hitler')) {
    return ['War', 'WorldWar2', 'Military']
  }
  
  // Civil Rights Movement
  if (content.includes('martin luther king') || content.includes('civil rights') || content.includes('rosa parks') || content.includes('i have a dream')) {
    return ['Rights', 'CivilRights', 'Freedom']
  }
  
  // Kennedy assassination
  if (content.includes('kennedy') && (content.includes('assassination') || content.includes('shot') || content.includes('dallas'))) {
    return ['Politics', 'Tragedy', 'President']
  }
  
  // Watergate
  if (content.includes('watergate') || (content.includes('nixon') && content.includes('resign'))) {
    return ['Politics', 'Scandal', 'Government']
  }
  
  // Internet and technology breakthroughs
  if (content.includes('internet') || content.includes('world wide web') || content.includes('tim berners-lee')) {
    return ['Technology', 'Internet', 'Innovation']
  }
  
  // MTV and television
  if (content.includes('mtv') || content.includes('music television') || (content.includes('video') && content.includes('radio star'))) {
    return ['MTV', 'Music', 'Television', 'Culture']
  }
  
  // Television and broadcasting
  if (content.includes('television') || content.includes('broadcast') || content.includes('tv') || content.includes('network')) {
    return ['Television', 'Media', 'Culture']
  }
  
  // BROADER CATEGORY MATCHING
  // Wars and conflicts (general)
  if (content.includes('war') || content.includes('battle') || content.includes('invasion') || content.includes('conflict')) {
    return ['War', 'Military', 'Conflict']
  }
  
  // Space and technology
  if (content.includes('space') || content.includes('rocket') || content.includes('satellite') || content.includes('nasa')) {
    return ['Space', 'Technology', 'Exploration']
  }
  
  // Politics and government
  if (content.includes('election') || content.includes('president') || content.includes('prime minister') || content.includes('government')) {
    return ['Politics', 'Government', 'Leadership']
  }
  
  // Science and discoveries
  if (content.includes('discovery') || content.includes('research') || content.includes('nobel') || content.includes('scientist')) {
    return ['Science', 'Discovery', 'Innovation']
  }
  
  // Natural disasters
  if (content.includes('earthquake') || content.includes('tsunami') || content.includes('hurricane') || content.includes('flood')) {
    return ['Disaster', 'Natural', 'Tragedy']
  }
  
  // Sports and achievements
  if (content.includes('olympic') || content.includes('world cup') || content.includes('championship') || content.includes('record')) {
    return ['Sports', 'Achievement', 'Competition']
  }
  
  // Music and entertainment
  if (content.includes('music') || content.includes('concert') || content.includes('album') || content.includes('song')) {
    return ['Music', 'Culture', 'Entertainment']
  }
  
  // Art and culture
  if (content.includes('art') || content.includes('painting') || content.includes('museum') || content.includes('culture')) {
    return ['Art', 'Culture', 'Heritage']
  }
  
  // Rights and social movements
  if (content.includes('rights') || content.includes('freedom') || content.includes('protest') || content.includes('movement')) {
    return ['Rights', 'Social', 'Freedom']
  }
  
  // Ancient history
  if (content.includes('ancient') || content.includes('rome') || content.includes('egypt') || content.includes('bc') || content.includes('empire')) {
    return ['Ancient', 'History', 'Civilization']
  }
  
  // Aviation
  if (content.includes('flight') || content.includes('plane') || content.includes('aircraft') || content.includes('aviation')) {
    return ['Aviation', 'Technology', 'Transportation']
  }
  
  // Default fallback
  return ['History', 'Event']
}

// Transform Wikipedia API response to our data structure
const transformWikipediaEvent = async (event, index, selectedMonth, selectedDay, userSelectedYear = null) => {
  const eventYear = parseInt(event.year)
  const displayYear = userSelectedYear || eventYear // Use user's year if provided
  const categories = categorizeEvent(event.text, event.pages?.[0]?.titles?.normalized || '')
  
  // Use bulletproof image system
  const imageUrl = await getHistoricalImage(categories, event.pages?.[0]?.titles?.normalized)
  
  return {
    id: `wiki_${Date.now()}_${index}`,
    date: `${getMonthName(selectedMonth)} ${selectedDay}, ${displayYear}`,
    title: event.pages?.[0]?.titles?.normalized || event.text.substring(0, 100) + '...',
    description: event.text,
    image: imageUrl,
    categories: categories,
    year: eventYear, // Keep the actual event year for filtering
    displayYear: displayYear, // The year to show to user
    month: selectedMonth,
    day: selectedDay,
    quickFacts: [
      { title: "Year", description: displayYear.toString() },
      { title: "Source", description: "Wikipedia" },
      { title: "Category", description: categories[0] }
    ]
  }
}

// Helper function to get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1]
}

// Transform Today in History API response to our data structure
// eslint-disable-next-line no-unused-vars
const transformTodayInHistoryEvent = async (event, selectedMonth, selectedDay) => {
  const year = parseInt(event.year)
  const categories = categorizeEvent(event.text, '')
  
  return {
    id: `today_${Date.now()}_${Math.random()}`,
    date: `${getMonthName(selectedMonth)} ${selectedDay}, ${year}`,
    title: event.text.length > 100 ? event.text.substring(0, 97) + '...' : event.text,
    description: event.text,
    image: await getHistoricalImage(categories),
    categories: categories,
    year: year,
    month: selectedMonth,
    day: selectedDay,
    quickFacts: [
      { title: "Year", description: year.toString() },
      { title: "Source", description: "Today in History" },
      { title: "Category", description: categories[0] }
    ]
  }
}

// Transform Numbers API response to our data structure
// eslint-disable-next-line no-unused-vars
const transformNumbersEvent = async (text, selectedMonth, selectedDay) => {
  // Extract year from the text (basic parsing)
  const yearMatch = text.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
  const categories = categorizeEvent(text, '')
  
  return {
    id: `numbers_${Date.now()}_${Math.random()}`,
    date: `${getMonthName(selectedMonth)} ${selectedDay}, ${year}`,
    title: text.length > 100 ? text.substring(0, 97) + '...' : text,
    description: text,
    image: await getHistoricalImage(categories),
    categories: categories,
    year: year,
    month: selectedMonth,
    day: selectedDay,
    quickFacts: [
      { title: "Year", description: year.toString() },
      { title: "Source", description: "Numbers API" },
      { title: "Category", description: categories[0] }
    ]
  }
}

// Fetch from Today in History API
// eslint-disable-next-line no-unused-vars
const fetchFromTodayInHistoryAPI = async (month, day) => {
  try {
    const url = `${TODAY_IN_HISTORY_API_BASE}/${month}/${day}`
    console.log(`Fetching from Today in History API: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Today in History API error: ${response.status}`)
    
    const data = await response.json()
    
    if (data.data && data.data.Events) {
      return await Promise.all(data.data.Events.map(async (event, index) => {
        const yearMatch = event.text.match(/(\d{4})/)
        const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
        const categories = categorizeEvent(event.text, '')
        
        return {
          id: `history_${Date.now()}_${index}`,
          date: `${getMonthName(month)} ${day}, ${year}`,
          title: event.text.split(' - ')[0] || event.text.substring(0, 100),
          description: event.text,
          image: await getHistoricalImage(categories),
          categories: categories,
          year: year,
          month: month,
          day: day,
          quickFacts: [
            { title: "Year", description: year.toString() },
            { title: "Source", description: "Today in History" },
            { title: "Category", description: categories[0] }
          ]
        }
      }))
    }
    
    return []
  } catch (error) {
    console.error('Today in History API error:', error)
    return []
  }
}

// Fetch from Numbers API for date facts
// eslint-disable-next-line no-unused-vars
const fetchFromNumbersAPI = async (month, day) => {
  try {
    const url = `${NUMBERS_API_BASE}/${month}/${day}/date?json`
    console.log(`Fetching from Numbers API: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Numbers API error: ${response.status}`)
    
    const data = await response.json()
    
    if (data.text && data.found) {
      const yearMatch = data.text.match(/(\d{4})/)
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
      const categories = categorizeEvent(data.text, '')
      
      return [{
        id: `numbers_${Date.now()}`,
        date: `${getMonthName(month)} ${day}, ${year}`,
        title: data.text.split(' - ')[0] || data.text.substring(0, 100),
        description: data.text,
        image: await getHistoricalImage(categories),
        categories: categories,
        year: year,
        month: month,
        day: day,
        quickFacts: [
          { title: "Year", description: year.toString() },
          { title: "Source", description: "Numbers API" },
          { title: "Type", description: "Date Fact" }
        ]
      }]
    }
    
    return []
  } catch (error) {
    console.error('Numbers API error:', error)
    return []
  }
}

// Fetch events for a specific date using multiple APIs
export const fetchEventsForDate = async (month, day, userSelectedYear = null) => {
  try {
    // Format month and day with leading zeros
    const formattedMonth = month.toString().padStart(2, '0')
    const formattedDay = day.toString().padStart(2, '0')
    
    console.log(`Fetching events for ${month}/${day} - API First Strategy`)
    
    // Get local events as backup
    const localEventsForDate = getLocalEventsForDate(month, day)
    
    // TRY API FIRST with reasonable timeout (3 seconds)
    try {
      console.log('Attempting Wikipedia API fetch...')
      const wikipediaEvents = await Promise.race([
        fetchFromWikipediaAPI(month, day, formattedMonth, formattedDay, userSelectedYear),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout - 3 seconds')), 3000)
        )
      ])
      
      if (wikipediaEvents.length > 0) {
        console.log(`✅ SUCCESS: Found ${wikipediaEvents.length} Wikipedia events for ${month}/${day}`)
        
        // Add source information to events
        const eventsWithSource = wikipediaEvents.map(event => ({
          ...event,
          dataSource: 'Wikipedia API',
          fetchTime: new Date().toISOString()
        }))
        
        // MIX API and LOCAL events for variety
        if (localEventsForDate.length > 0) {
          console.log(`Combining ${wikipediaEvents.length} API + ${localEventsForDate.length} local events`)
          const localWithSource = localEventsForDate.slice(0, 2).map(event => ({
            ...event,
            dataSource: 'Local Database',
            fetchTime: new Date().toISOString()
          }))
          return [...eventsWithSource, ...localWithSource]
        }
        
        return eventsWithSource
      } else {
        console.log(`⚠️ API returned no events for ${month}/${day}`)
      }
    } catch (error) {
      console.log(`❌ API request failed: ${error.message}`)
    }
    
    // FALLBACK: Local events if API failed or returned no results
    if (localEventsForDate.length > 0) {
      console.log(`📂 Using ${localEventsForDate.length} local events for ${month}/${day}`)
      return localEventsForDate.map(event => ({
        ...event,
        dataSource: 'Local Database',
        fetchTime: new Date().toISOString()
      }))
    }
    
    // LAST RESORT: Random local event
    console.log(`🎲 No specific events found for ${month}/${day}, using random local event`)
    const allLocal = getAllLocalEvents()
    const randomEvent = allLocal[Math.floor(Math.random() * allLocal.length)]
    return [{
      ...randomEvent,
      dataSource: 'Local Database (Random)',
      fetchTime: new Date().toISOString()
    }]
    
  } catch (error) {
    console.error('Error fetching events:', error)
    
    // Fallback chain: local events for date -> random local event
    const localEventsForDate = getLocalEventsForDate(month, day)
    if (localEventsForDate.length > 0) {
      console.log(`Error fallback: using ${localEventsForDate.length} local events for ${month}/${day}`)
      return localEventsForDate
    } else {
      console.log(`Error fallback: returning random local event for ${month}/${day}`)
      const allLocal = getAllLocalEvents()
      return [allLocal[Math.floor(Math.random() * allLocal.length)]]
    }
  }
}

// Fetch from Wikipedia API (extracted from original function)
const fetchFromWikipediaAPI = async (month, day, formattedMonth, formattedDay, userSelectedYear = null) => {
  const cacheKey = getCacheKey('wikipedia', month, day, userSelectedYear)
  
  // Check cache first
  const cached = getCached(cacheKey)
  if (cached) {
    console.log(`Using cached Wikipedia data for ${month}/${day}`)
    return cached
  }
  
  try {
    const url = `${WIKIPEDIA_API_BASE}/events/${formattedMonth}/${formattedDay}`
    console.log(`Fetching from Wikipedia API: ${url}`)
    
    const response = await fetchWithTimeout(url)
    if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`)
    
    const data = await response.json()
    
    if (!data.events || data.events.length === 0) {
      setCache(cacheKey, [])
      return []
    }
    
    // Transform Wikipedia events to our format - use optimized batch processing
    const transformationRequests = data.events
      .slice(0, 6) // Reduced from 8 to 6 for faster initial response
      .map((event, index) => 
        transformWikipediaEvent(event, index, month, day, userSelectedYear)
      )
    
    // Process transformations in smaller batches to prevent overwhelming image service
    const transformedEvents = await processBatch(transformationRequests, 2)
    
    // Cache the results
    setCache(cacheKey, transformedEvents)
    return transformedEvents
  } catch (error) {
    console.error('Wikipedia API error:', error)
    // Cache empty result to avoid repeated failed requests
    setCache(cacheKey, [])
    return []
  }
}

// Specific function for "This Day in History" feature
export const fetchThisDayInHistory = async () => {
  const today = new Date()
  const month = today.getMonth() + 1 // getMonth() is 0-based
  const day = today.getDate()
  
  console.log(`This Day in History: Fetching events for ${month}/${day} (${today.toDateString()})`)
  
  try {
    // Always try to get events for today's date first
    const events = await fetchEventsForDate(month, day)
    
    if (events.length > 0) {
      // Return a random event from today's date
      const selectedEvent = events[Math.floor(Math.random() * events.length)]
      console.log(`Found event for exact date ${month}/${day}: ${selectedEvent.title}`)
      return selectedEvent
    } else {
      console.log(`No events found for exact date ${month}/${day}, trying nearby dates...`)
      
      // If no events for today, try a few days around today (within the same month first)
      const nearbyDates = []
      
      // Try days around today in the same month
      for (let offset = 1; offset <= 5; offset++) {
        if (day + offset <= 31) nearbyDates.push({ month, day: day + offset })
        if (day - offset >= 1) nearbyDates.push({ month, day: day - offset })
      }
      
      // Try the same day in adjacent months
      const prevMonth = month === 1 ? 12 : month - 1
      const nextMonth = month === 12 ? 1 : month + 1
      nearbyDates.push({ month: prevMonth, day })
      nearbyDates.push({ month: nextMonth, day })
      
      for (const date of nearbyDates) {
        try {
          const nearbyEvents = await fetchEventsForDate(date.month, date.day)
          if (nearbyEvents.length > 0) {
            const selectedEvent = nearbyEvents[Math.floor(Math.random() * nearbyEvents.length)]
            console.log(`Using nearby date ${date.month}/${date.day} for This Day in History: ${selectedEvent.title}`)
            return selectedEvent
          }
        } catch {
          // Continue to next date if this one fails
          continue
        }
      }
      
      // If still no events, try to find any event from the same month
      console.log(`No nearby events found, trying any event from month ${month}...`)
      const allLocal = getAllLocalEvents()
      const monthEvents = allLocal.filter(event => event.month === month)
      
      if (monthEvents.length > 0) {
        const selectedEvent = monthEvents[Math.floor(Math.random() * monthEvents.length)]
        console.log(`Using event from same month: ${selectedEvent.title}`)
        return selectedEvent
      }
      
      // Last resort: random local event
      console.log('Using random historical event as last resort')
      return allLocal[Math.floor(Math.random() * allLocal.length)]
    }
  } catch (error) {
    console.error('This Day in History error:', error)
    // Fallback to local events for today
    const localEvents = getLocalEventsForDate(month, day)
    if (localEvents.length > 0) {
      return localEvents[Math.floor(Math.random() * localEvents.length)]
    } else {
      const allLocal = getAllLocalEvents()
      return allLocal[Math.floor(Math.random() * allLocal.length)]
    }
  }
}

// Get local events for a specific date
export const getLocalEventsForDate = (month, day) => {
  return localEvents.filter(event => 
    event.month === month && event.day === day
  )
}

// Get all local events (for random selection)
export const getAllLocalEvents = () => {
  return localEvents
}

// Function to track event clicks for learning
export const trackEventClick = (query, eventId, eventTitle, eventCategories = [], timeSpent = 0) => {
  searchAnalytics.trackClick(query, eventId, eventTitle, eventCategories, timeSpent)
}

// Function to get search suggestions based on user history
export const getSearchSuggestions = (partialQuery = '', limit = 5) => {
  return searchAnalytics.getSearchSuggestions(partialQuery, limit)
}

// Function to get learning insights for debugging/optimization
export const getLearningInsights = () => {
  return searchAnalytics.getLearningInsights()
}

// Function to export analytics data
export const exportAnalyticsData = () => {
  return searchAnalytics.exportData()
}

// Fetch random event (enhanced API prioritization)
export const fetchRandomEvent = async () => {
  try {
    // Reduced attempts for better performance
    let attempts = 0
    const maxAttempts = 3 // Reduced from 6 to prevent excessive API calls
    const apiTimeout = 2500 // Reduced timeout for faster fallback
    
    while (attempts < maxAttempts) {
      // Get a random date from the current year or historical range
      const randomMonth = Math.floor(Math.random() * 12) + 1
      const randomDay = Math.floor(Math.random() * 28) + 1 // Safe day range
      
      // Try API first with timeout control
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), apiTimeout)
        
        const events = await Promise.race([
          fetchEventsForDate(randomMonth, randomDay),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Random event timeout')), apiTimeout)
          )
        ])
        clearTimeout(timeoutId)
        
        if (events.length > 0) {
          // Prioritize API events over cached/local events
          const apiEvents = events.filter(event => 
            event.dataSource && event.dataSource.includes('Wikipedia API')
          )
          
          if (apiEvents.length > 0) {
            const selectedEvent = selectVariedEvent('random', apiEvents)
            if (selectedEvent) {
              console.log('Selected varied random API event:', selectedEvent.title)
              return selectedEvent
            }
            return apiEvents[Math.floor(Math.random() * apiEvents.length)]
          }
          
          // If no API events, use any available events with variety selection
          const selectedEvent = selectVariedEvent('random', events)
          if (selectedEvent) {
            return selectedEvent
          }
          return events[Math.floor(Math.random() * events.length)]
        }
      } catch (apiError) {
        console.log(`Random API attempt ${attempts + 1} failed:`, apiError.message)
      }
      
      attempts++
    }
    
    // After exhausting API attempts, check cache before going to local
    const cacheKeys = []
    for (let i = 0; i < 3; i++) {
      const randomMonth = Math.floor(Math.random() * 12) + 1
      const randomDay = Math.floor(Math.random() * 28) + 1
      cacheKeys.push(getCacheKey('wikipedia', randomMonth, randomDay))
    }
    
    for (const cacheKey of cacheKeys) {
      const cached = getCached(cacheKey)
      if (cached && cached.length > 0) {
        const selectedCached = selectVariedEvent('random', cached)
        if (selectedCached) {
          console.log('Selected varied cached event:', selectedCached.title)
          return selectedCached
        }
      }
    }
    
    // Final fallback to local random event with variety
    console.log('Falling back to local events for random selection')
    const localEvents = getAllLocalEvents()
    const selectedLocal = selectVariedEvent('random', localEvents)
    return selectedLocal || localEvents[Math.floor(Math.random() * localEvents.length)]
    
  } catch (error) {
    console.error('Error fetching random event:', error)
    // Always fallback to local random event with variety
    const localEvents = getAllLocalEvents()
    const selectedLocal = selectVariedEvent('random', localEvents)
    return selectedLocal || localEvents[Math.floor(Math.random() * localEvents.length)]
  }
}

// Search for events by text query
export const searchHistoricalEvents = async (query) => {
  const cacheKey = getCacheKey('search', query)
  
  // DEBUGGING: Clear cache for pharaoh/egypt queries to test fresh results
  if (query.toLowerCase().includes('pharaoh') || query.toLowerCase().includes('pharoah') || query.toLowerCase().includes('egypt')) {
    console.log(`🧹 CLEARING CACHE for ancient history query: "${query}"`)
    localStorage.removeItem(cacheKey)
  }
  
  // Check cache first
  const cached = getCached(cacheKey)
  if (cached) {
    console.log(`Using cached search results for: "${query}"`)
    
    // Apply learning-based boosts to cached results
    const boostedResults = applyLearningBoosts(query, cached)
    
    // Track analytics for cached search
    searchAnalytics.trackSearch(query, boostedResults, 'cached')
    return boostedResults
  }
  
  // Check for active request to prevent duplicates
  if (activeRequests.has(cacheKey)) {
    console.log(`Waiting for active search request: "${query}"`)
    return activeRequests.get(cacheKey)
  }
  
  const searchPromise = performSearchWithAnalytics(query, cacheKey)
  activeRequests.set(cacheKey, searchPromise)
  
  try {
    const result = await searchPromise
    return result
  } finally {
    activeRequests.delete(cacheKey)
  }
}

const performSearchWithAnalytics = async (query, cacheKey) => {
  try {
    console.log(`🔍 MAIN SEARCH: "${query}"`)
    
    // Get search suggestions based on user's history
    const suggestions = searchAnalytics.getSearchSuggestions(query, 3)
    if (suggestions.length > 0) {
      console.log(`💡 Analytics suggestions for "${query}":`, suggestions.map(s => s.query))
    }
    
    // Enhanced search terms to get more specific historical events
    const enhancedQuery = enhanceSearchQuery(query)
    console.log(`🚀 Enhanced query: "${enhancedQuery}"`)
    
    let searchData = null
    let searchAttempts = []
    
    // Try multiple search strategies
    const searchStrategies = [
      { query: enhancedQuery, description: 'Enhanced query' },
      { query: query, description: 'Original query' },
      // Create simplified versions by removing common words
      { query: query.replace(/\b(the|a|an|first|last|earliest|latest|most|some)\b/gi, '').trim(), description: 'Simplified query' },
      // Try just the main subject terms
      { query: extractMainTerms(query), description: 'Main terms only' }
    ].filter(s => s.query && s.query.length > 0)
    
    for (const strategy of searchStrategies) {
      try {
        console.log(`🔍 Trying ${strategy.description}: "${strategy.query}"`)
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(strategy.query)}&limit=5&format=json&origin=*`
        
        const searchResponse = await fetchWithTimeout(searchUrl)
        const currentSearchData = await searchResponse.json()
        
        if (currentSearchData[1] && currentSearchData[1].length > 0) {
          console.log(`✅ Found ${currentSearchData[1].length} results with ${strategy.description}`)
          searchData = currentSearchData
          break
        } else {
          console.log(`❌ No results with ${strategy.description}`)
          searchAttempts.push(strategy.description)
        }
      } catch (error) {
        console.error(`Error with ${strategy.description}:`, error)
        searchAttempts.push(`${strategy.description} (error)`)
      }
    }
    
    if (!searchData || !searchData[1] || searchData[1].length === 0) {
      console.log(`❌ All Wikipedia search strategies failed. Tried: ${searchAttempts.join(', ')}`)
      console.log(`🏠 Falling back to local search`)
      // Fallback to local events search
      const localResults = searchLocalEventsWithAnalytics(query)
      setCache(cacheKey, localResults)
      
      // Track analytics
      searchAnalytics.trackSearch(query, localResults, 'local_fallback')
      return localResults
    }
    
    const events = []
    
    // Process search results and filter out generic date pages
    const relevantResults = filterRelevantResults(searchData[1], searchData[3], query)
    
    const extractPromises = relevantResults.slice(0, 3).map(async (result, i) => {
      const pageTitle = result.title
      const pageUrl = result.url
      
      // Get page extract/summary
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro&explaintext&exsectionformat=plain&origin=*`
      
      try {
        const extractResponse = await fetchWithTimeout(extractUrl)
        const extractData = await extractResponse.json()
        
        const pages = extractData.query?.pages
        if (pages) {
          const page = Object.values(pages)[0]
          if (page && page.extract) {
            // Skip if this is a generic date page
            if (isGenericDatePage(page.extract, pageTitle, query)) {
              console.log(`Skipping generic date page: ${pageTitle}`)
              return null
            }
            
            // Try to extract a date from the content
            const dateMatch = page.extract.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i)
            
            let eventDate = 'Unknown'
            let year = 'Unknown'
            let month = null
            let day = null
            
            if (dateMatch) {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
              day = parseInt(dateMatch[1])
              month = monthNames.indexOf(dateMatch[2]) + 1
              year = parseInt(dateMatch[3])
              eventDate = `${dateMatch[2]} ${day}, ${year}`
            }
            
            const categories = categorizeEvent(page.extract, pageTitle)
            
            // Use bulletproof image system
            const imageUrl = await getHistoricalImage(categories, pageTitle)
            
            return {
              id: `search_${Date.now()}_${i}`,
              title: pageTitle,
              description: page.extract.substring(0, 300) + '...',
              date: eventDate,
              year: year,
              month: month,
              day: day,
              categories: categories,
              image: imageUrl,
              source: 'Wikipedia Search',
              url: pageUrl,
              quickFacts: [
                { title: "Source", description: "Wikipedia" },
                { title: "Search Query", description: query },
                { title: "Category", description: categories[0] || 'Historical Event' }
              ]
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching extract for ${pageTitle}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(extractPromises)
    events.push(...results.filter(Boolean))
    
    // Apply learning-based boosts
    let finalResults = events
    if (events.length > 0) {
      finalResults = applyLearningBoosts(query, events)
      setCache(cacheKey, finalResults)
      
      // Track analytics
      searchAnalytics.trackSearch(query, finalResults, 'api_success')
      return finalResults
    }
    
    // Fallback to local search with analytics
    const localResults = searchLocalEventsWithAnalytics(query)
    setCache(cacheKey, localResults)
    
    // Track analytics
    searchAnalytics.trackSearch(query, localResults, 'api_fallback')
    return localResults
    
  } catch (error) {
    console.error('Error searching Wikipedia:', error)
    const localResults = searchLocalEventsWithAnalytics(query)
    setCache(cacheKey, localResults)
    
    // Track analytics
    searchAnalytics.trackSearch(query, localResults, 'error_fallback')
    return localResults
  }
}

// Apply learning-based boosts to search results
const applyLearningBoosts = (query, results) => {
  const boosts = searchAnalytics.getSearchBoosts(query, results)
  
  if (boosts.size === 0) {
    return results // No learning data yet
  }
  
  // Sort results by boost factor
  const boostedResults = [...results].sort((a, b) => {
    const boostA = boosts.get(a.id) || 1.0
    const boostB = boosts.get(b.id) || 1.0
    return boostB - boostA
  })
  
  console.log(`🧠 Applied learning boosts to ${boostedResults.length} results`)
  return boostedResults
}

// Local search with analytics integration
const searchLocalEventsWithAnalytics = (query) => {
  const results = searchLocalEvents(query)
  
  // Track engagement patterns
  if (results.length > 0) {
    // Check if this is a repeat search
    const previousSearches = searchAnalytics.data?.searchQueries?.get(query.toLowerCase())
    if (previousSearches && previousSearches.count > 1) {
      searchAnalytics.trackEngagement('repeat_search', { query })
    }
    
    // Track source preference for local events
    searchAnalytics.trackEngagement('source_preference', { source: 'Local Events' })
  }
  
  return results
}

// Helper function to enhance search queries for better historical event results
// Helper function to extract main terms from a query
const extractMainTerms = (query) => {
  const commonWords = ['the', 'a', 'an', 'first', 'last', 'earliest', 'latest', 'most', 'some', 'who', 'what', 'when', 'where', 'how', 'why', 'is', 'was', 'were', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'ought']
  
  const words = query.toLowerCase().split(/\s+/)
  const mainTerms = words.filter(word => 
    word.length > 2 && 
    !commonWords.includes(word) &&
    !/^\d+$/.test(word) // Remove standalone numbers
  )
  
  return mainTerms.join(' ')
}

const enhanceSearchQuery = (query) => {
  const queryLower = query.toLowerCase().trim()
  
  // Handle specific date formats that should return historical events
  if (queryLower.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}$/)) {
    return `${query} historical events attacks disasters`
  }
  
  // Handle number dates like "September 11" or "9/11"
  if (queryLower === 'september 11' || queryLower === '9/11') {
    return 'September 11 attacks 2001 World Trade Center'
  }
  
  // Handle other specific dates with known major events
  if (queryLower === 'december 7') {
    return 'Pearl Harbor attack December 7 1941'
  }
  if (queryLower === 'november 22') {
    return 'JFK assassination John F Kennedy November 22 1963'
  }
  if (queryLower === 'april 14' || queryLower === 'april 15') {
    return 'Abraham Lincoln assassination Titanic sinking April 1865 1912'
  }
  if (queryLower === 'july 20') {
    return 'Apollo 11 moon landing Neil Armstrong July 20 1969'
  }
  if (queryLower === 'october 30') {
    return 'Berlin Wall fall October 30 1961'
  }
  
  // Enhanced ancient Egypt and pharaoh queries with semantic variations
  if (queryLower.includes('pharaoh') || queryLower.includes('pharoah') || queryLower.includes('egypt') || queryLower.includes('egyptian')) {
    if (queryLower.includes('first') || queryLower.includes('earliest') || queryLower.includes('original')) {
      return 'Narmer Menes first pharaoh ancient Egypt unification upper lower dynasty prehistoric predynastic'
    }
    if (queryLower.includes('last') || queryLower.includes('final') || queryLower.includes('end')) {
      return 'Cleopatra Ptolemy last pharaoh ancient Egypt Roman conquest Augustus Caesar'
    }
    if (queryLower.includes('famous') || queryLower.includes('greatest') || queryLower.includes('powerful')) {
      return 'Ramesses Khufu Hatshepsut Akhenaten Tutankhamun famous pharaohs ancient Egypt'
    }
    if (queryLower.includes('pyramid') || queryLower.includes('build') || queryLower.includes('construct')) {
      return 'Khufu Khafre pyramid Giza ancient Egypt pharaoh builder construction'
    }
    return `${query} ancient Egypt pharaoh dynasty kingdom Nile Memphis Thebes`
  }
  
  // Enhanced ancient civilizations with broader terms
  if (queryLower.includes('ancient') || queryLower.includes('mesopotamia') || queryLower.includes('babylon') || queryLower.includes('sumer')) {
    if (queryLower.includes('first') || queryLower.includes('earliest')) {
      return 'Sumer Mesopotamia first civilization Uruk Ur cuneiform writing'
    }
    return `${query} ancient civilization history archaeology empire Mesopotamia Babylon Assyria`
  }
  
  // Enhanced Roman Empire queries with semantic expansion
  if (queryLower.includes('roman') || queryLower.includes('rome') || queryLower.includes('caesar')) {
    if (queryLower.includes('first') || queryLower.includes('founding') || queryLower.includes('start')) {
      return 'Romulus founding Rome 753 BCE Roman Kingdom republic empire'
    }
    if (queryLower.includes('emperor') || queryLower.includes('ruler')) {
      return 'Augustus Caesar emperor Roman Empire imperial period'
    }
    if (queryLower.includes('fall') || queryLower.includes('end') || queryLower.includes('collapse')) {
      return 'fall Roman Empire 476 CE Western barbarian invasion decline'
    }
    return `${query} Roman Empire emperor republic ancient history legion conquest`
  }
  
  // Enhanced Greek history queries
  if (queryLower.includes('greek') || queryLower.includes('greece') || queryLower.includes('athens') || queryLower.includes('sparta')) {
    if (queryLower.includes('first') || queryLower.includes('early') || queryLower.includes('ancient')) {
      return 'Minoan Mycenaean ancient Greece Bronze Age civilization Crete'
    }
    if (queryLower.includes('democracy') || queryLower.includes('politics')) {
      return 'Athens democracy Pericles ancient Greece political system citizenship'
    }
    if (queryLower.includes('war') || queryLower.includes('battle') || queryLower.includes('fight')) {
      return 'Persian Wars Marathon Thermopylae Peloponnesian War ancient Greece'
    }
    return `${query} ancient Greece classical antiquity philosophy democracy polis city-state`
  }
  
  // Enhanced war-related queries with semantic understanding
  if (queryLower.includes('world war') || queryLower.includes('wwii') || queryLower.includes('ww2')) {
    if (queryLower.includes('start') || queryLower.includes('begin') || queryLower.includes('first')) {
      return 'World War 2 begins invasion Poland 1939 Hitler Germany'
    }
    if (queryLower.includes('end') || queryLower.includes('finish') || queryLower.includes('victory')) {
      return 'World War 2 ends VE Day VJ Day 1945 Allied victory'
    }
    return `${query} battles events timeline history Nazi Germany Allied forces`
  }
  
  // Enhanced space-related queries
  if (queryLower.includes('space') || queryLower.includes('moon') || queryLower.includes('apollo')) {
    if (queryLower.includes('first') || queryLower.includes('earliest')) {
      return 'Sputnik first satellite space exploration 1957 Soviet Union'
    }
    if (queryLower.includes('landing') || queryLower.includes('walk')) {
      return 'Apollo 11 moon landing Neil Armstrong Buzz Aldrin 1969'
    }
    return `${query} mission NASA astronaut rocket satellite exploration`
  }
  
  // Enhanced civil rights queries
  if (queryLower.includes('civil rights') || queryLower.includes('martin luther king')) {
    if (queryLower.includes('speech') || queryLower.includes('dream')) {
      return 'I Have a Dream speech Martin Luther King March on Washington 1963'
    }
    if (queryLower.includes('bus') || queryLower.includes('boycott')) {
      return 'Montgomery Bus Boycott Rosa Parks civil rights movement 1955'
    }
    return `${query} movement speech march protest segregation equality`
  }
  
  // Enhanced political figure queries
  if (queryLower.includes('kennedy') || queryLower.includes('jfk')) {
    if (queryLower.includes('assassination') || queryLower.includes('death') || queryLower.includes('killed')) {
      return 'JFK assassination John F Kennedy Dallas November 22 1963 Lee Harvey Oswald'
    }
    if (queryLower.includes('speech') || queryLower.includes('inaugural')) {
      return 'JFK inaugural address ask not what your country 1961'
    }
    return `${query} president presidency Cuba Bay of Pigs missile crisis`
  }
  
  // Enhanced disaster queries
  if (queryLower.includes('titanic')) {
    return `Titanic sinking disaster iceberg 1912 ship maritime tragedy Atlantic`
  }
  
  // Enhanced technology queries with semantic expansion
  if (queryLower.includes('internet') || queryLower.includes('computer') || queryLower.includes('web')) {
    if (queryLower.includes('first') || queryLower.includes('invention') || queryLower.includes('created')) {
      return 'ARPANET first computer network internet invention 1969 DARPA'
    }
    if (queryLower.includes('world wide web') || queryLower.includes('www')) {
      return 'World Wide Web Tim Berners-Lee invention 1989 internet browser'
    }
    return `${query} invention history development ARPANET computer network digital`
  }
  
  // Enhanced queries for revolutionary events
  if (queryLower.includes('revolution')) {
    if (queryLower.includes('american') || queryLower.includes('independence')) {
      return 'American Revolution independence 1776 Declaration Boston Tea Party'
    }
    if (queryLower.includes('french')) {
      return 'French Revolution 1789 Bastille Marie Antoinette guillotine'
    }
    if (queryLower.includes('industrial')) {
      return 'Industrial Revolution steam engine factory textile manufacturing'
    }
    return `${query} uprising rebellion political social change`
  }
  
  // For general queries, add historical context terms with semantic expansion
  const words = queryLower.split(/\s+/)
  let expandedTerms = []
  
  // Add semantic expansions for common historical terms
  if (words.some(w => ['king', 'queen', 'ruler', 'monarch'].includes(w))) {
    expandedTerms.push('monarchy', 'royal', 'crown', 'dynasty', 'reign')
  }
  if (words.some(w => ['war', 'battle', 'fight', 'conflict'].includes(w))) {
    expandedTerms.push('military', 'army', 'soldier', 'victory', 'defeat')
  }
  if (words.some(w => ['discovery', 'invention', 'create', 'found'].includes(w))) {
    expandedTerms.push('innovation', 'breakthrough', 'pioneer', 'develop')
  }
  
  const expandedQuery = expandedTerms.length > 0 
    ? `${query} ${expandedTerms.join(' ')} historical event history significance`
    : `${query} historical event history significance`
    
  return expandedQuery
}

// Helper function to filter out generic date pages and keep relevant historical events
const filterRelevantResults = (titles, urls, originalQuery) => {
  const results = []
  
  for (let i = 0; i < titles.length && i < urls.length; i++) {
    const title = titles[i]
    const url = urls[i]
    const titleLower = title.toLowerCase()
    
    // Skip generic date pages
    if (isGenericDateTitle(titleLower, originalQuery)) {
      console.log(`Filtering out generic date page: ${title}`)
      continue
    }
    
    // Prioritize specific historical events
    const relevanceScore = calculateRelevanceScore(titleLower, originalQuery.toLowerCase())
    
    results.push({
      title,
      url,
      relevanceScore
    })
  }
  
  // Sort by relevance score (higher is better)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

// Helper function to identify generic date titles
const isGenericDateTitle = (titleLower, originalQuery) => {
  const queryLower = originalQuery.toLowerCase()
  
  // Generic date patterns to avoid
  const genericPatterns = [
    /^\w+ \d{1,2}$/,  // "September 11", "December 7", etc.
    /^\d{1,2}\/\d{1,2}$/,  // "9/11", "12/7", etc.
    /^\w+ \d{4}$/,  // "September 2001", etc.
    /^\d{4}$/,  // Just a year
    /^list of/,  // "List of events"
    /^timeline/,  // "Timeline of"
    /^category:/,  // Category pages
    /^\w+ in \w+$/  // "Events in September"
  ]
  
  // Check if title matches generic patterns
  for (const pattern of genericPatterns) {
    if (pattern.test(titleLower)) {
      return true
    }
  }
  
  // Special case: if searching for "September 11" and title is exactly "September 11", it's generic
  if (queryLower === 'september 11' && titleLower === 'september 11') {
    return true
  }
  
  return false
}

// Helper function to identify generic date page content
const isGenericDatePage = (extract, title, originalQuery) => {
  const extractLower = extract.toLowerCase()
  const titleLower = title.toLowerCase()
  const queryLower = originalQuery.toLowerCase()
  
  // Generic content indicators
  const genericIndicators = [
    'is the \\d+(?:st|nd|rd|th) day of the year',  // "is the 254th day of the year"
    '\\d+ days remain until the end of the year',  // "111 days remain until the end of the year"
    'gregorian calendar',
    'leap year',
    'the following events occurred',
    'events that occurred on',
    'born on this day',
    'died on this day'
  ]
  
  // Check for generic content patterns
  for (const indicator of genericIndicators) {
    if (extractLower.match(new RegExp(indicator))) {
      return true
    }
  }
  
  // If the page is just about the date itself without specific events
  if (queryLower === 'september 11' && titleLower === 'september 11' && 
      !extractLower.includes('attack') && !extractLower.includes('terrorism') && 
      !extractLower.includes('world trade center')) {
    return true
  }
  
  return false
}

// Helper function to calculate relevance score for search results
const calculateRelevanceScore = (titleLower, queryLower) => {
  let score = 0
  
  // Exact match gets highest score
  if (titleLower === queryLower) {
    score += 100
  }
  
  // Specific historical event indicators get high scores
  const historicalEventTerms = [
    'attack', 'assassination', 'war', 'battle', 'invasion', 'bombing',
    'disaster', 'tragedy', 'crisis', 'revolution', 'independence',
    'landing', 'mission', 'discovery', 'invention', 'treaty',
    'death', 'birth', 'speech', 'march', 'protest', 'movement'
  ]
  
  for (const term of historicalEventTerms) {
    if (titleLower.includes(term)) {
      score += 20
    }
  }
  
  // Specific event names get high scores
  const specificEvents = [
    'september 11 attacks', 'world trade center', 'pearl harbor',
    'jfk assassination', 'lincoln assassination', 'titanic',
    'apollo 11', 'moon landing', 'berlin wall', 'watergate',
    'civil rights', 'martin luther king', 'world war'
  ]
  
  for (const event of specificEvents) {
    if (titleLower.includes(event)) {
      score += 50
    }
  }
  
  // Penalty for generic terms
  const genericTerms = ['list', 'timeline', 'category', 'events in', 'born', 'died']
  for (const term of genericTerms) {
    if (titleLower.includes(term)) {
      score -= 30
    }
  }
  
  return score
}

// Search local events by query
const searchLocalEvents = (query) => {
  const allLocal = getAllLocalEvents()
  const queryLower = query.toLowerCase().trim()
  
  console.log(`🔍 LOCAL SEARCH: "${queryLower}"`)
  
  // Enhanced search for date-based queries
  const dateBasedResults = searchByDateQuery(queryLower, allLocal)
  if (dateBasedResults.length > 0) {
    console.log(`📅 DATE-BASED RESULTS FOUND: ${dateBasedResults.length}`)
    return dateBasedResults
  }
  
  // Search in titles and descriptions with enhanced matching
  const matchingEvents = allLocal.filter(event => {
    const titleLower = event.title.toLowerCase()
    const descLower = event.description.toLowerCase()
    const categoriesLower = event.categories.map(cat => cat.toLowerCase())
    
    // Exact phrase match gets highest priority
    if (titleLower.includes(queryLower) || descLower.includes(queryLower)) {
      return true
    }
    
    // Category match
    if (categoriesLower.some(cat => cat.includes(queryLower) || queryLower.includes(cat))) {
      return true
    }
    
    // For ancient history queries, be much more strict about keyword matching
    if (queryLower.includes('pharaoh') || queryLower.includes('pharoah') || 
        queryLower.includes('egypt') || queryLower.includes('egyptian') ||
        queryLower.includes('ancient') || queryLower.includes('civilization')) {
      // Only match if we find direct ancient history terms
      const ancientTerms = ['egypt', 'egyptian', 'pharaoh', 'pharoah', 'ancient', 'civilization', 'dynasty', 'pyramid', 'nile']
      const eventText = `${titleLower} ${descLower} ${categoriesLower.join(' ')}`
      const hasAncientTerms = ancientTerms.some(term => eventText.includes(term))
      
      if (!hasAncientTerms) {
        console.log(`🚫 Rejecting non-ancient event for ancient query: ${event.title}`)
        return false
      }
    }
    
    // Keyword matching for complex queries
    const queryWords = queryLower.split(/\s+/)
    const eventText = `${titleLower} ${descLower} ${categoriesLower.join(' ')}`
    
    const matchCount = queryWords.filter(word => 
      word.length > 2 && eventText.includes(word)
    ).length
    
    // Match if at least half the words are found
    return matchCount >= Math.ceil(queryWords.length / 2)
  })
  
  if (matchingEvents.length > 0) {
    console.log(`✅ EXACT MATCHES FOUND: ${matchingEvents.length}`)
    console.log(`📝 Matches:`, matchingEvents.map(e => e.title))
    
    // For ancient history queries, if we don't have actual ancient history matches, skip to contextual fallback
    if (queryLower.includes('pharaoh') || queryLower.includes('pharoah') || 
        queryLower.includes('egypt') || queryLower.includes('egyptian') ||
        queryLower.includes('ancient') || queryLower.includes('civilization')) {
      const ancientTerms = ['egypt', 'egyptian', 'pharaoh', 'pharoah', 'ancient', 'civilization', 'dynasty', 'pyramid', 'nile']
      const hasRelevantAncientResults = matchingEvents.some(event => {
        const eventText = `${event.title} ${event.description} ${event.categories.join(' ')}`.toLowerCase()
        return ancientTerms.some(term => eventText.includes(term))
      })
      
      if (!hasRelevantAncientResults) {
        console.log(`🏺 No relevant ancient history matches found, using contextual fallback`)
        return getContextualFallback(queryLower, allLocal)
      }
    }
    
    // Sort by relevance - exact title matches first
    const sorted = matchingEvents.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      
      if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1
      if (!aTitle.includes(queryLower) && bTitle.includes(queryLower)) return 1
      
      return 0
    })
    
    return sorted.slice(0, 5) // Return up to 5 matching events
  }
  
  // Enhanced fuzzy matching for partial queries
  const fuzzyMatches = findFuzzyMatches(queryLower, allLocal)
  if (fuzzyMatches.length > 0) {
    // Check if this is an ancient history query that should use contextual fallback instead
    if (queryLower.includes('pharaoh') || queryLower.includes('pharoah') || 
        queryLower.includes('egypt') || queryLower.includes('egyptian') ||
        queryLower.includes('ancient') || queryLower.includes('civilization')) {
      // Skip fuzzy matches for ancient history - use contextual fallback
      console.log('🏺 Ancient history query detected, skipping fuzzy matches for contextual fallback')
    } else {
      console.log(`🎯 FUZZY MATCHES FOUND: ${fuzzyMatches.length}`)
      return fuzzyMatches
    }
  }
  
  // If no matches, return a contextual response based on query type
  console.log('📚 USING CONTEXTUAL FALLBACK')
  return getContextualFallback(queryLower, allLocal)
}

// Helper function to search by date-specific queries
const searchByDateQuery = (queryLower, allLocal) => {
  // Handle specific date formats
  const datePatterns = [
    { 
      pattern: /^september\s*11$|^9\/11$|^sept\s*11$/,
      filter: (event) => event.categories.includes('Terrorism') || 
                         event.title.toLowerCase().includes('september 11') ||
                         event.description.toLowerCase().includes('world trade center')
    },
    {
      pattern: /^december\s*7$/,
      filter: (event) => event.title.toLowerCase().includes('pearl harbor') ||
                         event.description.toLowerCase().includes('pearl harbor')
    },
    {
      pattern: /^november\s*22$/,
      filter: (event) => event.title.toLowerCase().includes('jfk') ||
                         event.title.toLowerCase().includes('kennedy') ||
                         event.description.toLowerCase().includes('kennedy')
    },
    {
      pattern: /^april\s*1[45]$/,
      filter: (event) => event.title.toLowerCase().includes('lincoln') ||
                         event.title.toLowerCase().includes('titanic')
    },
    {
      pattern: /^july\s*20$/,
      filter: (event) => event.title.toLowerCase().includes('apollo') ||
                         event.title.toLowerCase().includes('moon')
    },
    {
      pattern: /^october\s*30$/,
      filter: (event) => event.title.toLowerCase().includes('berlin wall') ||
                         event.description.toLowerCase().includes('berlin wall')
    }
  ]
  
  for (const { pattern, filter } of datePatterns) {
    if (pattern.test(queryLower)) {
      const matches = allLocal.filter(filter)
      if (matches.length > 0) {
        console.log(`Found ${matches.length} date-specific matches for "${queryLower}"`)
        return matches
      }
    }
  }
  
  // Handle general month/day queries
  const monthDayMatch = queryLower.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})$/)
  if (monthDayMatch) {
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    const month = monthNames.indexOf(monthDayMatch[1]) + 1
    const day = parseInt(monthDayMatch[2])
    
    const exactDateMatches = allLocal.filter(event => 
      event.month === month && event.day === day
    )
    
    if (exactDateMatches.length > 0) {
      console.log(`Found ${exactDateMatches.length} exact date matches for ${month}/${day}`)
      return exactDateMatches
    }
  }
  
  return []
}

// Helper function for fuzzy matching
const findFuzzyMatches = (queryLower, allLocal) => {
  const fuzzyMatches = []
  
  // Enhanced semantic keyword mapping
  const semanticMappings = {
    // Ancient history terms
    'pharaoh': ['pharoah', 'king', 'ruler', 'dynasty', 'egypt', 'egyptian'],
    'pharoah': ['pharaoh', 'king', 'ruler', 'dynasty', 'egypt', 'egyptian'],
    'egypt': ['egyptian', 'pharaoh', 'pharoah', 'nile', 'pyramid', 'ancient'],
    'ancient': ['old', 'early', 'primitive', 'historic', 'antiquity'],
    
    // War and conflict terms
    'war': ['battle', 'conflict', 'fight', 'invasion', 'combat', 'military'],
    'battle': ['war', 'fight', 'conflict', 'combat', 'engagement'],
    
    // Political terms
    'president': ['leader', 'ruler', 'head', 'chief', 'commander'],
    'king': ['ruler', 'monarch', 'emperor', 'pharaoh', 'leader'],
    'queen': ['ruler', 'monarch', 'empress', 'leader'],
    
    // Technology terms
    'computer': ['technology', 'digital', 'electronic', 'machine'],
    'internet': ['web', 'network', 'online', 'digital'],
    
    // Space terms
    'space': ['cosmic', 'astronaut', 'rocket', 'satellite', 'moon'],
    'moon': ['lunar', 'space', 'astronaut', 'apollo'],
    
    // Time-related terms
    'first': ['earliest', 'initial', 'original', 'beginning', 'start'],
    'last': ['final', 'end', 'latest', 'conclusion'],
    'early': ['first', 'initial', 'beginning', 'ancient', 'primitive'],
  }
  
  // Filter out common words that shouldn't drive matching
  const commonWords = ['the', 'first', 'last', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'and', 'or', 'but', 'a', 'an', 'is', 'was', 'were', 'are', 'be', 'been']
  
  // Extract meaningful words and their semantic variations
  const queryWords = queryLower.split(/\s+/).filter(word => 
    word.length > 2 && !commonWords.includes(word)
  )
  
  // Add semantic variations to the search terms
  const expandedQueryWords = new Set(queryWords)
  queryWords.forEach(word => {
    if (semanticMappings[word]) {
      semanticMappings[word].forEach(variation => expandedQueryWords.add(variation))
    }
  })
  
  const allSearchTerms = Array.from(expandedQueryWords)
  
  // If we have no meaningful words left, don't fuzzy match
  if (allSearchTerms.length === 0) {
    return []
  }
  
  console.log(`🔍 Fuzzy search with terms: [${queryWords.join(', ')}] + semantic variations: [${allSearchTerms.filter(t => !queryWords.includes(t)).join(', ')}]`)
  
  for (const event of allLocal) {
    const eventText = `${event.title} ${event.description} ${event.categories.join(' ')}`.toLowerCase()
    
    let exactMatchScore = 0
    let semanticMatchScore = 0
    let partialMatchScore = 0
    
    // Score different types of matches
    for (const word of queryWords) {
      if (eventText.includes(word)) {
        exactMatchScore += 2 // Exact matches get highest score
      }
    }
    
    for (const word of allSearchTerms) {
      if (eventText.includes(word) && !queryWords.includes(word)) {
        semanticMatchScore += 1 // Semantic matches get medium score
      }
    }
    
    // Partial word matching for typos and variations
    for (const word of queryWords) {
      const partialMatches = eventText.split(/\s+/).filter(eventWord => 
        (eventWord.length > 3 && word.length > 3) && 
        (eventWord.includes(word.substring(0, word.length - 1)) || 
         word.includes(eventWord.substring(0, eventWord.length - 1)))
      )
      if (partialMatches.length > 0) {
        partialMatchScore += 0.5
      }
    }
    
    const totalScore = exactMatchScore + semanticMatchScore + partialMatchScore
    const maxPossibleScore = queryWords.length * 2
    const matchPercentage = totalScore / maxPossibleScore
    
    // Require at least 30% match but prioritize exact and semantic matches
    if (matchPercentage >= 0.3 || exactMatchScore > 0) {
      fuzzyMatches.push({
        event,
        score: totalScore,
        exactMatches: exactMatchScore,
        semanticMatches: semanticMatchScore,
        partialMatches: partialMatchScore
      })
    }
  }
  
  // Sort by total score, then by exact matches, then by semantic matches
  fuzzyMatches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.exactMatches !== a.exactMatches) return b.exactMatches - a.exactMatches
    return b.semanticMatches - a.semanticMatches
  })
  
  const results = fuzzyMatches.slice(0, 5).map(match => match.event)
  
  if (results.length > 0) {
    console.log(`🎯 Fuzzy matches found:`, results.map((r, i) => `${i+1}. ${r.title} (${fuzzyMatches[i].exactMatches}E/${fuzzyMatches[i].semanticMatches}S/${fuzzyMatches[i].partialMatches}P)`))
  }
  
  return results
}

// Helper function to provide contextual fallbacks
const getContextualFallback = (queryLower, allLocal) => {
  // Handle ancient civilization queries
  if (queryLower.includes('pharaoh') || queryLower.includes('pharoah') || 
      queryLower.includes('egypt') || queryLower.includes('egyptian') ||
      queryLower.includes('ancient') || queryLower.includes('civilization')) {
    
    // Return a custom educational message for ancient history queries
    return [{
      id: `ancient_fallback_${Date.now()}`,
      title: 'Ancient Egypt: First Pharaohs',
      description: 'The first pharaoh of ancient Egypt is traditionally considered to be Narmer (also known as Menes), who unified Upper and Lower Egypt around 3100 BCE. Archaeological evidence suggests the unification process was complex, involving several rulers. The early pharaohs established the foundations of one of history\'s greatest civilizations along the Nile River.',
      date: 'c. 3100 BCE',
      year: -3100,
      month: null,
      day: null,
      categories: ['Ancient History', 'Egypt', 'Pharaohs', 'Civilization'],
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73e0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      source: 'Educational Content - No exact Wikipedia match found',
      url: 'https://en.wikipedia.org/wiki/Narmer',
      quickFacts: [
        { title: "Search Query", description: queryLower },
        { title: "Period", description: "Early Dynastic Period" },
        { title: "Significance", description: "Unification of Egypt" }
      ]
    }]
  }
  
  // Determine query type and provide relevant fallback
  if (queryLower.includes('war') || queryLower.includes('battle') || queryLower.includes('fight')) {
    const warEvents = allLocal.filter(event => 
      event.categories.some(cat => ['War', 'Military', 'Conflict'].includes(cat))
    )
    if (warEvents.length > 0) {
      const randomWar = warEvents[Math.floor(Math.random() * warEvents.length)]
      return [{
        ...randomWar,
        title: `War Related: ${randomWar.title}`,
        description: `No exact matches found for "${queryLower}". Here's a related war event: ${randomWar.description}`,
        source: 'Related War Event'
      }]
    }
  }
  
  if (queryLower.includes('space') || queryLower.includes('moon') || queryLower.includes('rocket')) {
    const spaceEvents = allLocal.filter(event => 
      event.categories.some(cat => ['Space', 'Moon', 'Technology'].includes(cat))
    )
    if (spaceEvents.length > 0) {
      const randomSpace = spaceEvents[Math.floor(Math.random() * spaceEvents.length)]
      return [{
        ...randomSpace,
        title: `Space Related: ${randomSpace.title}`,
        description: `No exact matches found for "${queryLower}". Here's a related space event: ${randomSpace.description}`,
        source: 'Related Space Event'
      }]
    }
  }
  
  if (queryLower.includes('president') || queryLower.includes('politic')) {
    const politicalEvents = allLocal.filter(event => 
      event.categories.some(cat => ['Politics', 'President', 'Government'].includes(cat))
    )
    if (politicalEvents.length > 0) {
      const randomPolitical = politicalEvents[Math.floor(Math.random() * politicalEvents.length)]
      return [{
        ...randomPolitical,
        title: `Political Related: ${randomPolitical.title}`,
        description: `No exact matches found for "${queryLower}". Here's a related political event: ${randomPolitical.description}`,
        source: 'Related Political Event'
      }]
    }
  }
  
  // For completely unrelated queries, provide an educational message
  if (!queryLower.match(/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/)) {
    return [{
      id: `no_results_${Date.now()}`,
      title: 'Search Not Found',
      description: `No historical events found matching "${queryLower}". Try searching for specific dates, historical figures, wars, inventions, or major events. Examples: "World War 2", "Moon Landing", "September 11", or "Civil Rights Movement".`,
      date: 'N/A',
      year: 'N/A',
      month: null,
      day: null,
      categories: ['Search Help'],
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      source: 'Search Assistance',
      url: 'https://en.wikipedia.org/wiki/History',
      quickFacts: [
        { title: "Search Query", description: queryLower },
        { title: "Suggestion", description: "Try more specific terms" },
        { title: "Examples", description: "Dates, people, events" }
      ]
    }]
  }
  
  // Default fallback for date-related queries
  const randomEvent = allLocal[Math.floor(Math.random() * allLocal.length)]
  return [{
    ...randomEvent,
    title: `Related: ${randomEvent.title}`,
    description: `No direct matches found for "${queryLower}". Here's a significant historical event: ${randomEvent.description}`,
    source: 'Related Historical Event'
  }]
}

// Search for events by category
export const searchEventsByCategory = async (category) => {
  try {
    console.log(`Searching for events in category: "${category}"`)
    
    // Define science-related search terms (using actual Wikipedia article names)
    const categorySearchTerms = {
      'Science': [
        'Penicillin', 'DNA', 'Apollo 11', 
        'Atomic bomb', 'Polio vaccine', 'Galileo Galilei',
        'Albert Einstein', 'Charles Darwin', 'Marie Curie',
        'Isaac Newton', 'ENIAC', 'ARPANET',
        'Steam engine', 'Benjamin Franklin', 'Vaccination',
        'X-ray', 'Periodic table', 'Microscope',
        'Nicolaus Copernicus', 'Louis Pasteur', 'Telescope'
      ],
      'Politics': [
        // Wars and Conflicts
        'World War', 'Civil War', 'Cold War', 'Vietnam War', 'Korean War',
        'World War I', 'World War II', 'battle', 'invasion', 'siege',
        
        // Revolutions and Independence
        'revolution', 'independence', 'French Revolution', 'American Revolution',
        'Russian Revolution', 'Industrial Revolution', 'liberation', 'uprising',
        
        // Governments and Leaders
        'president', 'king', 'queen', 'emperor', 'prime minister', 'dictator',
        'Napoleon', 'Churchill', 'Roosevelt', 'Gandhi', 'Mandela', 'Lincoln',
        
        // Treaties and Agreements
        'treaty', 'peace', 'agreement', 'alliance', 'United Nations', 'NATO',
        'European Union', 'constitution', 'declaration', 'charter',
        
        // International Events
        'diplomacy', 'summit', 'conference', 'embassy', 'sanctions', 'trade',
        'Berlin Wall', 'Iron Curtain', 'Cuban Missile Crisis', 'Pearl Harbor',
        
        // Political Systems
        'democracy', 'republic', 'monarchy', 'empire', 'federation', 'parliament',
        'election', 'vote', 'referendum', 'government', 'state', 'nation'
      ]
    }
    
    const searchTerms = categorySearchTerms[category] || [category.toLowerCase()]
    const events = []
    
    // Search Wikipedia for multiple terms related to the category
    // For Politics/World Events, search more extensively
    const searchCount = category === 'Politics' ? 5 : 4 // Slightly increased for better coverage
    const maxRetries = 2 // Keep retries conservative
    const searchTimeout = 3000 // 3 second timeout
    
    for (let i = 0; i < Math.min(searchCount, searchTerms.length); i++) {
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)]
      
      let retryCount = 0
      let foundValidEventForTerm = false
      
      while (retryCount < maxRetries && !foundValidEventForTerm) {
        try {
          // Search for the term directly without extra modifiers
          const eventSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=3&format=json&origin=*`
          
          // Add timeout to search requests
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), searchTimeout)
          
          const searchResponse = await fetch(eventSearchUrl, { 
            signal: controller.signal 
          })
          clearTimeout(timeoutId)
          
          if (!searchResponse.ok) {
            throw new Error(`Search failed with status: ${searchResponse.status}`)
          }
          
          const searchData = await searchResponse.json()
          
          console.log(`API search for "${term}" returned ${searchData[1]?.length || 0} results`)
          
          let foundValidEvent = false
        
        // Check multiple search results for actual historical events
        for (let j = 0; j < (searchData[1]?.length || 0); j++) {
          const pageTitle = searchData[1][j]
          const pageUrl = searchData[3][j]
          
          // Skip if title suggests it's a general article rather than a specific event
          if (pageTitle.toLowerCase().includes('list of') || 
              pageTitle.toLowerCase().includes('category:') ||
              pageTitle.toLowerCase().includes('timeline') ||
              !pageTitle.includes(' ')) {
            continue
          }
          
          // Get page extract
          const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro&explaintext&exsectionformat=plain&origin=*`
          
          const extractResponse = await fetch(extractUrl)
          const extractData = await extractResponse.json()
          
          const pages = extractData.query?.pages
          if (pages) {
            const page = Object.values(pages)[0]
            if (page && page.extract) {
              // More comprehensive date extraction
              const dateMatches = [
                page.extract.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i),
                page.extract.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i),
                page.extract.match(/(\d{4})-(\d{1,2})-(\d{1,2})/),
                page.extract.match(/in\s+(\d{4})/i)
              ]
              
              let eventDate = 'Historical Period'
              let year = 'Unknown'
              let month = null
              let day = null
              let dateMatch = null
              
              // Find the first valid date match
              for (const match of dateMatches) {
                if (match) {
                  dateMatch = match
                  break
                }
              }
              
              if (dateMatch) {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                
                if (dateMatch[0].includes('-')) {
                  // ISO format YYYY-MM-DD
                  year = parseInt(dateMatch[1])
                  month = parseInt(dateMatch[2])
                  day = parseInt(dateMatch[3])
                  eventDate = `${monthNames[month-1]} ${day}, ${year}`
                } else if (dateMatch[0].match(/in\s+(\d{4})/i)) {
                  // Just year
                  year = parseInt(dateMatch[1])
                  eventDate = `Year ${year}`
                } else if (dateMatch[2] && isNaN(dateMatch[2])) {
                  // Day Month Year format
                  day = parseInt(dateMatch[1])
                  month = monthNames.indexOf(dateMatch[2]) + 1
                  year = parseInt(dateMatch[3])
                  eventDate = `${dateMatch[2]} ${day}, ${year}`
                } else {
                  // Month Day, Year format
                  month = monthNames.indexOf(dateMatch[1]) + 1
                  day = parseInt(dateMatch[2])
                  year = parseInt(dateMatch[3])
                  eventDate = `${dateMatch[1]} ${day}, ${year}`
                }
                
                // Accept events with reasonable years OR if they seem to be historical topics
                const isHistoricalTopic = pageTitle.toLowerCase().includes('history') ||
                                         pageTitle.toLowerCase().includes('discovery') ||
                                         pageTitle.toLowerCase().includes('invention') ||
                                         pageTitle.toLowerCase().includes('galileo') ||
                                         pageTitle.toLowerCase().includes('periodic') ||
                                         pageTitle.toLowerCase().includes('telescope') ||
                                         pageTitle.toLowerCase().includes('evolution') ||
                                         page.extract.toLowerCase().includes('century') ||
                                         page.extract.toLowerCase().includes('historical') ||
                                         page.extract.toLowerCase().includes('discovered') ||
                                         page.extract.toLowerCase().includes('invented')
                
                if ((year !== 'Unknown' && year > 1000 && year < 2030) || isHistoricalTopic) {
                  foundValidEvent = true
                } else {
                  console.log(`Skipping non-historical article: ${pageTitle}`)
                  continue // Skip this result and try the next one
                }
              } else {
                // No specific date found, but check if it's a historical topic anyway
                const isHistoricalTopic = pageTitle.toLowerCase().includes('history') ||
                                         pageTitle.toLowerCase().includes('discovery') ||
                                         pageTitle.toLowerCase().includes('invention') ||
                                         pageTitle.toLowerCase().includes('galileo') ||
                                         pageTitle.toLowerCase().includes('periodic') ||
                                         pageTitle.toLowerCase().includes('telescope') ||
                                         pageTitle.toLowerCase().includes('evolution') ||
                                         page.extract.toLowerCase().includes('century') ||
                                         page.extract.toLowerCase().includes('historical') ||
                                         page.extract.toLowerCase().includes('discovered') ||
                                         page.extract.toLowerCase().includes('invented')
                
                if (isHistoricalTopic) {
                  foundValidEvent = true
                  eventDate = 'Historical Period'
                } else {
                  console.log(`Skipping non-historical article without date: ${pageTitle}`)
                  continue // No date found and not clearly historical, skip this result
                }
              }
              
              
              const categories = [category, ...categorizeEvent(page.extract, pageTitle)]
              
              // Try to get Wikipedia image
              let imageUrl = await fetchWikipediaImage(pageTitle, pageTitle)
              if (!imageUrl) {
                imageUrl = await getHistoricalImage(categories)
              }
              
              events.push({
                id: `category_${category}_${Date.now()}_${i}_${j}`,
                title: pageTitle,
                description: page.extract.substring(0, 350) + '...',
                date: eventDate,
                year: year,
                month: month,
                day: day,
                categories: categories,
                image: imageUrl,
                source: `${category} Discovery`,
                url: pageUrl,
                dataSource: 'Wikipedia API (Category Search)',
                fetchTime: new Date().toISOString(),
                quickFacts: [
                  { title: "Category", description: category },
                  { title: "Source", description: "Wikipedia" },
                  { title: "Date Found", description: eventDate },
                  { title: "Search Term", description: term }
                ]
              })
              
              break // Found a valid event, move to next search term
            }
          }
        }
        
        // If we found a valid event, set flag and break retry loop
        if (foundValidEvent) {
          foundValidEventForTerm = true
          break
        }
        
        // Increment retry count regardless of outcome  
        retryCount++
        
        // If this was the last retry, break and move to next search term
        if (retryCount >= maxRetries) {
          console.warn(`Failed to find valid event for ${term} after ${maxRetries} attempts`)
          break
        }
        
        } catch (error) {
          console.error(`Search attempt ${retryCount + 1} failed for ${term}:`, error)
          retryCount++
          
          // If this was the last retry, break and move to next search term
          if (retryCount >= maxRetries) {
            console.warn(`Failed to search for ${term} after ${maxRetries} attempts`)
            break
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }
    
    // If we found events, use variety selection
    if (events.length > 0) {
      const selectedEvent = selectVariedEvent(`category_${category}`, events)
      return selectedEvent ? [selectedEvent] : events.slice(0, 1)
    }
    
    // Fallback to local events in category with variety
    const fallbackEvents = searchLocalEventsByCategory(category)
    const selectedFallback = selectVariedEvent(`category_${category}`, fallbackEvents)
    return selectedFallback ? [selectedFallback] : fallbackEvents
    
  } catch (error) {
    console.error('Error searching by category:', error)
    const fallbackEvents = searchLocalEventsByCategory(category)
    const selectedFallback = selectVariedEvent(`category_${category}`, fallbackEvents)
    return selectedFallback ? [selectedFallback] : fallbackEvents
  }
}

// Search local events by category
const searchLocalEventsByCategory = (category) => {
  const allLocal = getAllLocalEvents()
  
  // Define category mappings for broader matching
  const categoryMappings = {
    'Politics': ['Politics', 'War', 'Military', 'Government', 'International', 'Empire', 'Ancient', 'Medieval', 'Freedom'],
    'Science': ['Science', 'Technology', 'Space', 'Discovery', 'Medical', 'Innovation'],
    'Culture': ['Culture', 'Music', 'Art', 'Literature', 'Entertainment', 'Television']
  }
  
  const searchCategories = categoryMappings[category] || [category]
  
  // Filter by category with broader matching
  const matchingEvents = allLocal.filter(event => 
    searchCategories.some(searchCat => 
      event.categories.some(cat => cat.toLowerCase().includes(searchCat.toLowerCase()))
    )
  )
  
  if (matchingEvents.length > 0) {
    return matchingEvents.slice(0, 3)
  }
  
  // If no matches, return random events with category context
  const randomEvents = allLocal.slice(0, 3).map(event => ({
    ...event,
    title: `${category} Related: ${event.title}`,
    description: `Here's a historical event that might interest ${category.toLowerCase()} enthusiasts: ${event.description}`,
    source: `Related ${category} Event`,
    categories: [category, ...event.categories]
  }))
  
  return randomEvents
}

// Search for trending historical events
export const searchTrendingEvents = async () => {
  try {
    console.log('Fetching trending historical events...')
    
    // Define trending topics based on current events, anniversaries, and popular searches
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    // eslint-disable-next-line no-unused-vars
    const currentDay = currentDate.getDate()
    
    const trendingTopics = [
      // Popular historical figures
      'Napoleon Bonaparte', 'Winston Churchill', 'Cleopatra', 'Julius Caesar',
      'Leonardo da Vinci', 'Mahatma Gandhi', 'Abraham Lincoln', 'Alexander the Great',
      
      // Major historical events  
      'World War II', 'French Revolution', 'American Revolution', 'Cold War',
      'Industrial Revolution', 'Renaissance', 'Ancient Rome', 'Ancient Egypt',
      
      // Significant discoveries and inventions
      'Printing press', 'Wheel', 'Agriculture', 'Bronze Age', 'Iron Age',
      
      // Anniversary-based trending (events that happened this month)
      'historical events ' + getMonthName(currentMonth),
      
      // Seasonal trending topics
      ...getSeasonalTrends(currentMonth),
      
      // Cultural and social movements
      'Civil rights movement', 'Women\'s suffrage', 'Abolition of slavery',
      'Fall of Berlin Wall', 'Moon landing', 'Titanic'
    ]
    
    const events = []
    
    // Search for multiple trending topics - balanced approach
    const maxSearchAttempts = 5 // Increased slightly for better coverage
    const searchTimeout = 3000 // 3 second timeout per search
    
    for (let i = 0; i < Math.min(maxSearchAttempts, trendingTopics.length); i++) {
      const topic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)]
      
      try {
        // Add timeout control
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), searchTimeout)
        
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=3&format=json&origin=*`
        
        const searchResponse = await fetch(searchUrl, { 
          signal: controller.signal 
        })
        clearTimeout(timeoutId)
        
        if (!searchResponse.ok) {
          console.warn(`Search failed for topic: ${topic}`)
          continue
        }
        const searchData = await searchResponse.json()
        
        // Check multiple search results for actual historical events
        let foundValidEvent = false
        for (let j = 0; j < Math.min(3, searchData[1]?.length || 0); j++) {
          const pageTitle = searchData[1][j]
          const pageUrl = searchData[3][j]
          
          // Skip if title suggests it's a general article rather than a specific event
          if (pageTitle.toLowerCase().includes('list of') || 
              pageTitle.toLowerCase().includes('category:') ||
              pageTitle.toLowerCase().includes('timeline')) {
            continue
          }
          
          try {
            // Get page extract with timeout
            const extractController = new AbortController()
            const extractTimeoutId = setTimeout(() => extractController.abort(), searchTimeout)
            
            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro&explaintext&exsectionformat=plain&origin=*`
            
            const extractResponse = await fetch(extractUrl, { 
              signal: extractController.signal 
            })
            clearTimeout(extractTimeoutId)
            
            if (!extractResponse.ok) continue
            
            const extractData = await extractResponse.json()
            
            const pages = extractData.query?.pages
            if (pages) {
              const page = Object.values(pages)[0]
              if (page && page.extract) {
                // Enhanced date extraction
                const dateMatches = [
                  page.extract.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i),
                  page.extract.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i),
                  page.extract.match(/(\d{4})-(\d{1,2})-(\d{1,2})/),
                  page.extract.match(/in\s+(\d{4})/i)
                ]
                
                let eventDate = 'Historical Period'
                let year = 'Unknown'
                let month = null
                let day = null
                let dateMatch = null
                
                // Find the first valid date match
                for (const match of dateMatches) {
                  if (match) {
                    dateMatch = match
                    break
                  }
                }
                
                if (dateMatch) {
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                  
                  if (dateMatch[0].includes('-')) {
                    // ISO format YYYY-MM-DD
                    year = parseInt(dateMatch[1])
                    month = parseInt(dateMatch[2])
                    day = parseInt(dateMatch[3])
                    eventDate = `${monthNames[month-1]} ${day}, ${year}`
                  } else if (dateMatch[0].match(/in\s+(\d{4})/i)) {
                    // Just year
                    year = parseInt(dateMatch[1])
                    eventDate = `Year ${year}`
                  } else if (dateMatch[2] && isNaN(dateMatch[2])) {
                    // Day Month Year format
                    day = parseInt(dateMatch[1])
                    month = monthNames.indexOf(dateMatch[2]) + 1
                    year = parseInt(dateMatch[3])
                    eventDate = `${dateMatch[2]} ${day}, ${year}`
                  } else {
                    // Month Day, Year format
                    month = monthNames.indexOf(dateMatch[1]) + 1
                    day = parseInt(dateMatch[2])
                    year = parseInt(dateMatch[3])
                    eventDate = `${dateMatch[1]} ${day}, ${year}`
                  }
                  
                  // Accept events with reasonable years OR if they seem to be historical topics
                  const isHistoricalTopic = pageTitle.toLowerCase().includes('history') ||
                                           pageTitle.toLowerCase().includes('war') ||
                                           pageTitle.toLowerCase().includes('revolution') ||
                                           pageTitle.toLowerCase().includes('discovery') ||
                                           pageTitle.toLowerCase().includes('invention') ||
                                           pageTitle.toLowerCase().includes('battle') ||
                                           pageTitle.toLowerCase().includes('empire') ||
                                           page.extract.toLowerCase().includes('century') ||
                                           page.extract.toLowerCase().includes('historical') ||
                                           page.extract.toLowerCase().includes('ancient') ||
                                           page.extract.toLowerCase().includes('medieval') ||
                                           page.extract.toLowerCase().includes('founded') ||
                                           page.extract.toLowerCase().includes('established')
                  
                  if ((year !== 'Unknown' && year > 1000 && year < 2030) || isHistoricalTopic) {
                    foundValidEvent = true
                  } else {
                    console.log(`Trending: Skipping non-historical article: ${pageTitle}`)
                    continue
                  }
                } else {
                  // No specific date found, but check if it's a historical topic anyway
                  const isHistoricalTopic = pageTitle.toLowerCase().includes('history') ||
                                           pageTitle.toLowerCase().includes('war') ||
                                           pageTitle.toLowerCase().includes('revolution') ||
                                           pageTitle.toLowerCase().includes('discovery') ||
                                           pageTitle.toLowerCase().includes('invention') ||
                                           pageTitle.toLowerCase().includes('battle') ||
                                           pageTitle.toLowerCase().includes('empire') ||
                                           page.extract.toLowerCase().includes('century') ||
                                           page.extract.toLowerCase().includes('historical') ||
                                           page.extract.toLowerCase().includes('ancient') ||
                                           page.extract.toLowerCase().includes('medieval') ||
                                           page.extract.toLowerCase().includes('founded') ||
                                           page.extract.toLowerCase().includes('established')
                  
                  if (isHistoricalTopic) {
                    foundValidEvent = true
                    eventDate = 'Historical Period'
                  } else {
                    console.log(`Trending: Skipping non-historical article without date: ${pageTitle}`)
                    continue
                  }
                }
                
                const categories = ['Trending', ...categorizeEvent(page.extract, pageTitle)]
                
                // Try to get Wikipedia image
                let imageUrl = await fetchWikipediaImage(pageTitle, pageTitle)
                if (!imageUrl) {
                  imageUrl = await getHistoricalImage(categories)
                }
                
                events.push({
                  id: `trending_${Date.now()}_${i}_${j}`,
                  title: pageTitle,
                  description: page.extract.substring(0, 350) + '...',
                  date: eventDate,
                  year: year,
                  month: month,
                  day: day,
                  categories: categories,
                  image: imageUrl,
                  source: 'Trending Historical',
                  url: pageUrl,
                  dataSource: 'Wikipedia API (Trending)',
                  fetchTime: new Date().toISOString(),
                  quickFacts: [
                    { title: "Trending Topic", description: topic },
                    { title: "Source", description: "Wikipedia" },
                    { title: "Date Found", description: eventDate },
                    { title: "Historical Impact", description: "High significance" }
                  ]
                })
                
                break // Found valid event, move to next topic
              }
            }
          } catch (extractError) {
            console.warn(`Extract failed for ${pageTitle}:`, extractError)
            continue
          }
        }
        
        // If we found a valid event, continue to next topic  
        if (foundValidEvent) {
          continue
        }
        
      } catch (error) {
        console.error(`Error searching for trending topic ${topic}:`, error)
        continue
      }
    }
    
    // If we found trending events, use variety selection to avoid repetition
    if (events.length > 0) {
      const selectedEvent = selectVariedEvent('trending', events)
      if (selectedEvent) {
        console.log('Selected varied trending event:', selectedEvent.title)
        return [selectedEvent]
      }
    }
    
    // Fallback to popular historical events with variety
    const fallbackEvents = getTrendingFallbackEvents()
    const selectedFallback = selectVariedEvent('trending', fallbackEvents)
    return selectedFallback ? [selectedFallback] : fallbackEvents
    
  } catch (error) {
    console.error('Error searching trending events:', error)
    const fallbackEvents = getTrendingFallbackEvents()
    const selectedFallback = selectVariedEvent('trending', fallbackEvents)
    return selectedFallback ? [selectedFallback] : fallbackEvents
  }
}

// Helper function to get seasonal trending topics
const getSeasonalTrends = (month) => {
  const seasonal = {
    12: ['Christmas history', 'winter solstice', 'New Year traditions'], // December
    1: ['New Year resolutions history', 'winter traditions'], // January
    2: ['Black History Month', 'presidents history'], // February
    3: ['spring celebrations', 'women history month'], // March
    4: ['Easter history', 'spring traditions'], // April
    5: ['Memorial Day history', 'spring celebrations'], // May
    6: ['summer solstice', 'graduation traditions'], // June
    7: ['Independence Day history', 'summer traditions'], // July
    8: ['summer history', 'back to school history'], // August
    9: ['autumn equinox', 'harvest festivals'], // September
    10: ['Halloween history', 'autumn traditions'], // October
    11: ['Thanksgiving history', 'harvest celebrations'] // November
  }
  
  return seasonal[month] || ['historical events', 'cultural traditions']
}

// Helper function to explain why something is trending
const getTrendingReason = (topic, month) => {
  if (topic.includes(getMonthName(month))) {
    return 'Current month anniversary'
  }
  if (topic.includes('artificial intelligence') || topic.includes('technology')) {
    return 'AI/Tech relevance'
  }
  if (topic.includes('climate') || topic.includes('environment')) {
    return 'Environmental awareness'
  }
  if (topic.includes('democracy') || topic.includes('rights')) {
    return 'Social relevance'
  }
  return 'Popular historical topic'
}

// Fallback trending events when API fails
const getTrendingFallbackEvents = () => {
  const allLocal = getAllLocalEvents()
  
  // Select diverse, high-impact events
  const trendingEvents = allLocal.filter(event => 
    event.categories.some(cat => 
      ['Space', 'Technology', 'Politics', 'War', 'Science', 'Rights', 'Freedom'].includes(cat)
    )
  ).slice(0, 3)
  
  return trendingEvents.map(event => ({
    ...event,
    source: 'Trending Historical',
    categories: ['Trending', ...event.categories],
    quickFacts: [
      ...event.quickFacts,
      { title: "Trending Status", description: "High historical impact" }
    ]
  }))
}