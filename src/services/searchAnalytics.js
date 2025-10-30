// Search Analytics and Learning System
// Tracks user interactions and improves search results over time

class SearchAnalytics {
  constructor() {
    this.storageKey = 'historisnap_search_analytics'
    this.data = this.loadAnalytics()
    this.sessionStartTime = Date.now()
    this.currentSession = this.generateSessionId()
    
    // Initialize analytics structure if not exists
    if (!this.data.version) {
      this.initializeAnalytics()
    }
    
    // Auto-save analytics periodically
    this.setupAutoSave()
  }
  
  initializeAnalytics() {
    this.data = {
      version: '1.0',
      totalSearches: 0,
      totalClicks: 0,
      totalTimeSpent: 0,
      searchQueries: new Map(),
      clickedResults: new Map(),
      categoryPreferences: new Map(),
      timePatterns: new Map(),
      userPatterns: {
        preferredSources: new Map(),
        averageSessionTime: 0,
        searchDepth: 0,
        repeatSearches: new Map()
      },
      popularEvents: new Map(),
      lastCleanup: Date.now(),
      sessions: []
    }
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Load analytics data from localStorage
  loadAnalytics() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert Maps back from stored arrays
        return {
          ...parsed,
          searchQueries: new Map(parsed.searchQueries || []),
          clickedResults: new Map(parsed.clickedResults || []),
          categoryPreferences: new Map(parsed.categoryPreferences || []),
          timePatterns: new Map(parsed.timePatterns || []),
          userPatterns: {
            ...parsed.userPatterns,
            preferredSources: new Map(parsed.userPatterns?.preferredSources || []),
            repeatSearches: new Map(parsed.userPatterns?.repeatSearches || [])
          },
          popularEvents: new Map(parsed.popularEvents || [])
        }
      }
    } catch (error) {
      console.warn('Failed to load search analytics:', error)
    }
    return {}
  }
  
  // Save analytics data to localStorage
  saveAnalytics() {
    try {
      // Convert Maps to arrays for storage
      const toStore = {
        ...this.data,
        searchQueries: Array.from(this.data.searchQueries.entries()),
        clickedResults: Array.from(this.data.clickedResults.entries()),
        categoryPreferences: Array.from(this.data.categoryPreferences.entries()),
        timePatterns: Array.from(this.data.timePatterns.entries()),
        userPatterns: {
          ...this.data.userPatterns,
          preferredSources: Array.from(this.data.userPatterns.preferredSources.entries()),
          repeatSearches: Array.from(this.data.userPatterns.repeatSearches.entries())
        },
        popularEvents: Array.from(this.data.popularEvents.entries())
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(toStore))
    } catch (error) {
      console.warn('Failed to save search analytics:', error)
    }
  }
  
  // Setup automatic saving every 30 seconds
  setupAutoSave() {
    setInterval(() => {
      this.saveAnalytics()
    }, 30000)
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession()
      this.saveAnalytics()
    })
  }
  
  // Track search query
  trackSearch(query, results, searchType = 'general') {
    const normalizedQuery = query.toLowerCase().trim()
    const timestamp = Date.now()
    const hour = new Date().getHours()
    
    // Update search statistics
    this.data.totalSearches++
    
    // Track query frequency and performance
    const queryData = this.data.searchQueries.get(normalizedQuery) || {
      count: 0,
      lastSearched: 0,
      results: [],
      clickRate: 0,
      avgTimeSpent: 0,
      searchType: searchType,
      improvements: 0
    }
    
    queryData.count++
    queryData.lastSearched = timestamp
    queryData.results.push({
      timestamp,
      resultCount: results.length,
      resultTitles: results.map(r => r.title).slice(0, 3) // Store top 3 titles
    })
    
    // Keep only recent results (last 10)
    if (queryData.results.length > 10) {
      queryData.results = queryData.results.slice(-10)
    }
    
    this.data.searchQueries.set(normalizedQuery, queryData)
    
    // Track time patterns
    const timeKey = `hour_${hour}`
    this.data.timePatterns.set(timeKey, (this.data.timePatterns.get(timeKey) || 0) + 1)
    
    // Track search depth
    this.data.userPatterns.searchDepth = (this.data.userPatterns.searchDepth + results.length) / 2
    
    console.log(`📊 Search tracked: "${query}" (${results.length} results)`)
  }
  
  // Track clicked results
  trackClick(query, eventId, eventTitle, eventCategories = [], timeSpent = 0) {
    const normalizedQuery = query.toLowerCase().trim()
    const timestamp = Date.now()
    
    this.data.totalClicks++
    this.data.totalTimeSpent += timeSpent
    
    // Update query click rate
    const queryData = this.data.searchQueries.get(normalizedQuery)
    if (queryData) {
      queryData.clickRate = (queryData.clickRate + 1) / 2 // Moving average
      queryData.avgTimeSpent = (queryData.avgTimeSpent + timeSpent) / 2
      this.data.searchQueries.set(normalizedQuery, queryData)
    }
    
    // Track clicked results
    const clickKey = `${normalizedQuery}:${eventId}`
    const clickData = this.data.clickedResults.get(clickKey) || {
      count: 0,
      lastClicked: 0,
      totalTimeSpent: 0,
      eventTitle,
      eventCategories
    }
    
    clickData.count++
    clickData.lastClicked = timestamp
    clickData.totalTimeSpent += timeSpent
    this.data.clickedResults.set(clickKey, clickData)
    
    // Track category preferences
    eventCategories.forEach(category => {
      const currentPref = this.data.categoryPreferences.get(category) || 0
      this.data.categoryPreferences.set(category, currentPref + 1)
    })
    
    // Track popular events
    const eventKey = `${eventId}:${eventTitle}`
    const popularity = this.data.popularEvents.get(eventKey) || 0
    this.data.popularEvents.set(eventKey, popularity + 1)
    
    console.log(`🎯 Click tracked: "${eventTitle}" from query "${query}"`)
  }
  
  // Track user engagement patterns
  trackEngagement(action, details = {}) {
    const patterns = this.data.userPatterns
    
    switch (action) {
      case 'repeat_search': {
        const query = details.query?.toLowerCase()
        if (query) {
          const count = patterns.repeatSearches.get(query) || 0
          patterns.repeatSearches.set(query, count + 1)
        }
        break
      }
        
      case 'source_preference': {
        const source = details.source
        if (source) {
          const count = patterns.preferredSources.get(source) || 0
          patterns.preferredSources.set(source, count + 1)
        }
        break
      }
        
      case 'session_time': {
        const sessionTime = details.timeSpent || 0
        patterns.averageSessionTime = (patterns.averageSessionTime + sessionTime) / 2
        break
      }
    }
  }
  
  // Get search suggestions based on learning
  getSearchSuggestions(partialQuery = '', limit = 5) {
    const suggestions = []
    const queryLower = partialQuery.toLowerCase()
    
    // Get most searched queries that match partial input
    const matchingQueries = Array.from(this.data.searchQueries.entries())
      .filter(([query]) => query.includes(queryLower))
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearched: data.lastSearched,
        type: 'popular'
      }))
    
    suggestions.push(...matchingQueries)
    
    // Add category-based suggestions
    if (suggestions.length < limit) {
      const topCategories = Array.from(this.data.categoryPreferences.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => ({
          query: category.toLowerCase(),
          type: 'category',
          reason: 'Based on your interests'
        }))
      
      suggestions.push(...topCategories.slice(0, limit - suggestions.length))
    }
    
    return suggestions
  }
  
  // Get personalized search boost factors
  getSearchBoosts(query, results) {
    const normalizedQuery = query.toLowerCase().trim()
    const boosts = new Map()
    
    // Boost based on previous clicks
    results.forEach(result => {
      let boost = 1.0
      
      // Category preference boost
      if (result.categories) {
        result.categories.forEach(category => {
          const preference = this.data.categoryPreferences.get(category) || 0
          boost += preference * 0.1 // 10% boost per preference point
        })
      }
      
      // Previous click boost
      const clickKey = `${normalizedQuery}:${result.id}`
      const clickData = this.data.clickedResults.get(clickKey)
      if (clickData) {
        boost += clickData.count * 0.2 // 20% boost per previous click
      }
      
      // Source preference boost
      if (result.source) {
        const sourcePref = this.data.userPatterns.preferredSources.get(result.source) || 0
        boost += sourcePref * 0.05 // 5% boost per source preference
      }
      
      // Time-based relevance
      const currentHour = new Date().getHours()
      const timeKey = `hour_${currentHour}`
      const timePopularity = this.data.timePatterns.get(timeKey) || 0
      boost += timePopularity * 0.02 // 2% boost for popular search times
      
      boosts.set(result.id, Math.min(boost, 3.0)) // Cap boost at 300%
    })
    
    return boosts
  }
  
  // Get learning insights for optimization
  getLearningInsights() {
    const insights = {
      totalInteractions: this.data.totalSearches + this.data.totalClicks,
      conversionRate: this.data.totalSearches > 0 ? this.data.totalClicks / this.data.totalSearches : 0,
      avgTimeSpent: this.data.totalClicks > 0 ? this.data.totalTimeSpent / this.data.totalClicks : 0,
      topQueries: Array.from(this.data.searchQueries.entries())
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10),
      topCategories: Array.from(this.data.categoryPreferences.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      peakHours: Array.from(this.data.timePatterns.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3),
      userPatterns: this.data.userPatterns,
      dataQuality: this.calculateDataQuality(),
      recommendations: this.generateRecommendations()
    }
    
    return insights
  }
  
  // Calculate data quality score
  calculateDataQuality() {
    let score = 0
    
    // Search volume quality
    if (this.data.totalSearches > 10) score += 25
    else if (this.data.totalSearches > 5) score += 15
    else if (this.data.totalSearches > 0) score += 5
    
    // Click quality
    if (this.data.totalClicks > 5) score += 25
    else if (this.data.totalClicks > 0) score += 10
    
    // Diversity quality
    if (this.data.categoryPreferences.size > 3) score += 25
    else if (this.data.categoryPreferences.size > 1) score += 15
    
    // Time span quality
    const daysSinceFirst = this.data.searchQueries.size > 0 ? 
      (Date.now() - Math.min(...Array.from(this.data.searchQueries.values()).map(q => q.lastSearched))) / (1000 * 60 * 60 * 24) : 0
    if (daysSinceFirst > 7) score += 25
    else if (daysSinceFirst > 1) score += 15
    
    return Math.min(score, 100)
  }
  
  // Generate optimization recommendations
  generateRecommendations() {
    const recommendations = []
    
    if (this.data.totalSearches < 5) {
      recommendations.push({
        type: 'engagement',
        message: 'Try more searches to improve personalization',
        priority: 'high'
      })
    }
    
    if (this.data.totalClicks / Math.max(this.data.totalSearches, 1) < 0.3) {
      recommendations.push({
        type: 'relevance',
        message: 'Search results could be more relevant - the system is learning your preferences',
        priority: 'medium'
      })
    }
    
    if (this.data.categoryPreferences.size < 3) {
      recommendations.push({
        type: 'diversity',
        message: 'Explore different historical categories to improve recommendations',
        priority: 'low'
      })
    }
    
    return recommendations
  }
  
  // Start session tracking
  startSession() {
    this.currentSession = this.generateSessionId()
    this.sessionStartTime = Date.now()
  }
  
  // End session and record data
  endSession() {
    const sessionDuration = Date.now() - this.sessionStartTime
    
    this.data.sessions.push({
      id: this.currentSession,
      startTime: this.sessionStartTime,
      duration: sessionDuration,
      searches: 0, // TODO: Track per session
      clicks: 0    // TODO: Track per session
    })
    
    // Keep only last 50 sessions
    if (this.data.sessions.length > 50) {
      this.data.sessions = this.data.sessions.slice(-50)
    }
    
    this.trackEngagement('session_time', { timeSpent: sessionDuration })
  }
  
  // Clean old data periodically
  cleanupOldData() {
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    
    // Only cleanup if it's been more than a week since last cleanup
    if (now - this.data.lastCleanup < (7 * 24 * 60 * 60 * 1000)) {
      return
    }
    
    // Clean old search queries (keep only last 30 days)
    for (const [query, data] of this.data.searchQueries.entries()) {
      if (data.lastSearched < thirtyDaysAgo) {
        this.data.searchQueries.delete(query)
      }
    }
    
    // Clean old click data
    for (const [key, data] of this.data.clickedResults.entries()) {
      if (data.lastClicked < thirtyDaysAgo) {
        this.data.clickedResults.delete(key)
      }
    }
    
    this.data.lastCleanup = now
    console.log('🧹 Analytics data cleanup completed')
  }
  
  // Export analytics data for debugging/analysis
  exportData() {
    return {
      summary: this.getLearningInsights(),
      rawData: {
        searches: Array.from(this.data.searchQueries.entries()),
        clicks: Array.from(this.data.clickedResults.entries()),
        categories: Array.from(this.data.categoryPreferences.entries()),
        timePatterns: Array.from(this.data.timePatterns.entries())
      }
    }
  }
  
  // Reset analytics data (for testing or privacy)
  reset() {
    localStorage.removeItem(this.storageKey)
    this.initializeAnalytics()
    console.log('🔄 Analytics data reset')
  }
}

// Create singleton instance
const searchAnalytics = new SearchAnalytics()

export default searchAnalytics