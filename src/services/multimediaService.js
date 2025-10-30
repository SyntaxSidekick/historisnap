/**
 * Multimedia Service - Dynamic content discovery for historical events
 * Searches for video and audio content related to historical events
 */

const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY' // Replace with actual API key
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

/**
 * Search for multimedia content related to a historical event
 * @param {Object} event - The historical event object
 * @returns {Promise<Object>} - Object containing video and audio arrays
 */
export const searchMultimediaContent = async (event) => {
  if (!event) return { videos: [], audio: [] }

  try {
    // Create search queries based on event data
    const searchQueries = generateSearchQueries(event)
    
    // Search for content using multiple strategies
    const results = await Promise.all([
      searchYouTubeContent(searchQueries.primary),
      searchYouTubeContent(searchQueries.secondary),
      searchCuratedContent(event)
    ])

    // Combine and deduplicate results
    const combinedResults = combineResults(results)
    
    // Filter and rank by relevance
    const filteredResults = filterByRelevance(combinedResults, event)
    
    return {
      videos: filteredResults.filter(item => item.type === 'video').slice(0, 3),
      audio: filteredResults.filter(item => item.type === 'audio').slice(0, 2)
    }
    
  } catch (error) {
    console.warn('Multimedia search failed:', error)
    return { videos: [], audio: [] }
  }
}

/**
 * Generate targeted search queries for an event
 */
const generateSearchQueries = (event) => {
  const { title, date, year } = event
  
  // Extract key terms from title
  const titleTerms = title.split(' ').filter(term => 
    term.length > 3 && !['the', 'and', 'with', 'for'].includes(term.toLowerCase())
  )

  return {
    primary: `${titleTerms.join(' ')} ${year} historical footage original`,
    secondary: `${title} ${date} documentary archive`,
    speech: `${titleTerms.join(' ')} speech audio original recording`,
    news: `${titleTerms.join(' ')} ${year} news report archive`
  }
}

/**
 * Search YouTube for content (placeholder - requires API key)
 */
const searchYouTubeContent = async (query) => {
  // For demo purposes, return mock data
  // In production, this would use the YouTube Data API
  return await mockYouTubeSearch(query)
}

/**
 * Mock YouTube search for demonstration
 */
const mockYouTubeSearch = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Return relevant mock results based on query patterns
  const mockResults = []
  
  if (query.includes('Apollo') || query.includes('moon')) {
    mockResults.push({
      id: 'apollo-landing',
      youtubeId: 'S9HdPi9Ikhk',
      title: 'Apollo 11 Moon Landing - Original NASA Footage',
      description: 'Original NASA footage of Neil Armstrong and Buzz Aldrin landing on the Moon',
      type: 'video',
      relevanceScore: 0.95,
      duration: '3:24'
    })
  }
  
  if (query.includes('Berlin Wall') || query.includes('fall')) {
    mockResults.push({
      id: 'berlin-wall',
      youtubeId: 'snSDCKJQbLc',
      title: 'Fall of the Berlin Wall - Historic Moment',
      description: 'Historic footage of the Berlin Wall being torn down in 1989',
      type: 'video',
      relevanceScore: 0.90,
      duration: '2:45'
    })
  }

  if (query.includes('Kennedy') || query.includes('assassination')) {
    mockResults.push({
      id: 'jfk-speech',
      youtubeId: 'th5A6ZQ28pE',
      title: 'JFK Inaugural Speech - Ask Not What Your Country Can Do',
      description: 'President Kennedy\'s famous inaugural address',
      type: 'video',
      relevanceScore: 0.88,
      duration: '4:12'
    })
  }

  if (query.includes('Martin Luther King') || query.includes('dream')) {
    mockResults.push({
      id: 'mlk-speech',
      youtubeId: 'vP4iY1TtS3s',
      title: 'Martin Luther King Jr. - I Have a Dream Speech',
      description: 'The complete "I Have a Dream" speech from the March on Washington',
      type: 'video',
      relevanceScore: 0.92,
      duration: '17:28'
    })
  }

  if (query.includes('World War') || query.includes('D-Day')) {
    mockResults.push({
      id: 'dday-footage',
      youtubeId: 'NiB_HeVVL4M',
      title: 'D-Day Landings - Original WWII Footage',
      description: 'Rare color footage of the D-Day landings at Normandy',
      type: 'video',
      relevanceScore: 0.85,
      duration: '8:33'
    })
  }

  if (query.includes('9/11') || query.includes('September 11')) {
    mockResults.push({
      id: 'sept11-news',
      youtubeId: 'ltzy5vRmN8Q',
      title: 'September 11, 2001 - Live News Coverage',
      description: 'Original live news coverage as events unfolded',
      type: 'video',
      relevanceScore: 0.90,
      duration: '12:15'
    })
  }

  if (query.includes('War of the Worlds') || query.includes('Orson Welles') || query.includes('radio')) {
    mockResults.push({
      id: 'war-worlds-radio',
      youtubeId: 'Xs0K4ApWl4g',
      title: 'War of the Worlds 1938 - Original Radio Broadcast',
      description: 'Complete CBS radio drama that caused nationwide panic',
      type: 'audio',
      relevanceScore: 0.95,
      duration: '57:45'
    })
  }

  return mockResults
}

/**
 * Search curated historical content database
 */
const searchCuratedContent = async (event) => {
  // Curated high-quality historical content
  const curatedDatabase = {
    // Space exploration
    'Apollo 11 Moon Landing': {
      youtubeId: 'S9HdPi9Ikhk',
      title: 'Apollo 11 Moon Landing - "One Small Step"',
      description: 'Neil Armstrong\'s first steps on the Moon with original audio',
      type: 'video',
      relevanceScore: 1.0
    },
    
    // Civil Rights
    'March on Washington': {
      youtubeId: 'vP4iY1TtS3s',
      title: 'Martin Luther King Jr. - I Have a Dream',
      description: 'Complete speech from the March on Washington',
      type: 'video',
      relevanceScore: 1.0
    },
    
    // Political events
    'Fall of the Berlin Wall': {
      youtubeId: 'snSDCKJQbLc',
      title: 'Berlin Wall Falls - Historic Moment',
      description: 'Citizens tear down the Berlin Wall in 1989',
      type: 'video',
      relevanceScore: 1.0
    },
    
    // Technology
    'MTV Launches': {
      youtubeId: 'W8r-tXRLazs',
      title: 'Video Killed the Radio Star - First MTV Video',
      description: 'The very first music video played on MTV',
      type: 'video',
      relevanceScore: 1.0
    },

    // Radio & Broadcasting
    'War of the Worlds Radio Broadcast': {
      youtubeId: 'Xs0K4ApWl4g',
      title: 'War of the Worlds 1938 Radio Broadcast - Original Audio',
      description: 'Complete original CBS radio broadcast that caused nationwide panic',
      type: 'audio',
      relevanceScore: 1.0
    }
  }

  const result = curatedDatabase[event.title]
  return result ? [result] : []
}

/**
 * Combine results from multiple sources
 */
const combineResults = (resultArrays) => {
  const combined = []
  const seenIds = new Set()

  resultArrays.forEach(results => {
    if (Array.isArray(results)) {
      results.forEach(item => {
        if (!seenIds.has(item.youtubeId)) {
          seenIds.add(item.youtubeId)
          combined.push(item)
        }
      })
    }
  })

  return combined
}

/**
 * Filter and rank results by relevance
 */
const filterByRelevance = (results, event) => {
  return results
    .filter(item => item.relevanceScore > 0.7) // Minimum quality threshold
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .map(item => ({
      ...item,
      eventId: event.id,
      searchedAt: new Date().toISOString()
    }))
}

/**
 * Get multimedia content for event with caching
 */
export const getEventMultimedia = async (event) => {
  if (!event) return null

  // Check cache first
  const cacheKey = `multimedia_${event.id}`
  const cached = localStorage.getItem(cacheKey)
  
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached)
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - new Date(parsedCache.timestamp).getTime()
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return parsedCache.data
      }
    } catch (error) {
      console.warn('Cache parse error:', error)
    }
  }

  // Search for new content
  const multimedia = await searchMultimediaContent(event)
  
  // Cache the results
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: multimedia,
      timestamp: new Date().toISOString()
    }))
  } catch (error) {
    console.warn('Failed to cache multimedia results:', error)
  }

  return multimedia
}

/**
 * Check if event has any multimedia content
 */
export const hasMultimediaContent = (multimedia) => {
  return multimedia && 
    (multimedia.videos?.length > 0 || multimedia.audio?.length > 0)
}