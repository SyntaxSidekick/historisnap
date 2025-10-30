/**
 * Recent Events Tracker Service
 * Prevents repetition of events when users click buttons multiple times
 */

const STORAGE_KEY_PREFIX = 'historisnap_recent_'
const MAX_RECENT_EVENTS = 10 // Track last 10 events per action type
const RESET_AFTER_HOURS = 24 // Reset tracking after 24 hours

/**
 * Get recently shown events for a specific action type
 * @param {string} actionType - Type of action (e.g., 'trending', 'random', 'category')
 * @returns {Array} Array of recent event IDs with timestamps
 */
export const getRecentEvents = (actionType) => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${actionType}`
    const stored = localStorage.getItem(storageKey)
    
    if (!stored) return []
    
    const recentEvents = JSON.parse(stored)
    const now = Date.now()
    const cutoffTime = now - (RESET_AFTER_HOURS * 60 * 60 * 1000)
    
    // Filter out events older than cutoff time
    return recentEvents.filter(event => event.timestamp > cutoffTime)
  } catch (error) {
    console.warn('Error retrieving recent events:', error)
    return []
  }
}

/**
 * Add an event to the recent events list
 * @param {string} actionType - Type of action
 * @param {string} eventId - Unique identifier for the event
 * @param {string} eventTitle - Title of the event for debugging
 */
export const addRecentEvent = (actionType, eventId, eventTitle) => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${actionType}`
    const recentEvents = getRecentEvents(actionType)
    
    // Add new event with timestamp
    const newEvent = {
      id: eventId,
      title: eventTitle,
      timestamp: Date.now()
    }
    
    // Add to beginning of array
    recentEvents.unshift(newEvent)
    
    // Keep only the most recent events
    const trimmedEvents = recentEvents.slice(0, MAX_RECENT_EVENTS)
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(trimmedEvents))
    
    console.log(`Tracked recent ${actionType} event:`, eventTitle)
  } catch (error) {
    console.warn('Error tracking recent event:', error)
  }
}

/**
 * Check if an event was recently shown
 * @param {string} actionType - Type of action
 * @param {string} eventId - Event ID to check
 * @returns {boolean} True if event was recently shown
 */
export const wasRecentlyShown = (actionType, eventId) => {
  const recentEvents = getRecentEvents(actionType)
  return recentEvents.some(event => event.id === eventId)
}

/**
 * Filter out recently shown events from a list
 * @param {string} actionType - Type of action
 * @param {Array} events - Array of events to filter
 * @returns {Array} Filtered events excluding recent ones
 */
export const filterRecentEvents = (actionType, events) => {
  const recentEvents = getRecentEvents(actionType)
  const recentIds = new Set(recentEvents.map(event => event.id))
  
  const filtered = events.filter(event => {
    // Check various possible ID formats
    const eventId = event.id || event.title || event.date
    return !recentIds.has(eventId)
  })
  
  console.log(`Filtered ${events.length - filtered.length} recent events from ${events.length} total`)
  return filtered
}

/**
 * Get statistics about recent event tracking
 * @param {string} actionType - Type of action
 * @returns {Object} Statistics object
 */
export const getRecentEventsStats = (actionType) => {
  const recentEvents = getRecentEvents(actionType)
  
  return {
    totalTracked: recentEvents.length,
    lastEventTime: recentEvents.length > 0 ? new Date(recentEvents[0].timestamp) : null,
    oldestEventTime: recentEvents.length > 0 ? new Date(recentEvents[recentEvents.length - 1].timestamp) : null,
    averageTimeBetween: recentEvents.length > 1 
      ? (recentEvents[0].timestamp - recentEvents[recentEvents.length - 1].timestamp) / (recentEvents.length - 1)
      : 0,
    recentTitles: recentEvents.slice(0, 5).map(event => event.title)
  }
}

/**
 * Clear recent events for a specific action type
 * @param {string} actionType - Type of action to clear
 */
export const clearRecentEvents = (actionType) => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${actionType}`
    localStorage.removeItem(storageKey)
    console.log(`Cleared recent events for ${actionType}`)
  } catch (error) {
    console.warn('Error clearing recent events:', error)
  }
}

/**
 * Clear all recent events
 */
export const clearAllRecentEvents = () => {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key)
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key))
    console.log(`Cleared ${keys.length} recent event trackers`)
  } catch (error) {
    console.warn('Error clearing all recent events:', error)
  }
}

/**
 * Enhanced selection that avoids recent events and provides variety
 * @param {string} actionType - Type of action
 * @param {Array} candidates - Array of candidate events
 * @param {number} maxAttempts - Maximum attempts to find non-recent event
 * @returns {Object|null} Selected event or null if none available
 */
export const selectVariedEvent = (actionType, candidates) => {
  if (!candidates || candidates.length === 0) return null
  
  const recentEvents = getRecentEvents(actionType)
  const recentIds = new Set(recentEvents.map(event => event.id))
  const recentTitles = new Set(recentEvents.map(event => event.title?.toLowerCase()))
  
  // First, try to find a completely fresh event
  const freshEvents = candidates.filter(event => {
    const eventId = event.id || event.title || event.date
    const eventTitle = event.title?.toLowerCase()
    return !recentIds.has(eventId) && !recentTitles.has(eventTitle)
  })
  
  if (freshEvents.length > 0) {
    const selected = freshEvents[Math.floor(Math.random() * freshEvents.length)]
    addRecentEvent(actionType, selected.id || selected.title || selected.date, selected.title)
    return selected
  }
  
  // If no fresh events, try older recent events (not in last 3)
  const recentLastThree = recentEvents.slice(0, 3).map(event => event.id)
  const recentLastThreeTitles = recentEvents.slice(0, 3).map(event => event.title?.toLowerCase())
  
  const olderEvents = candidates.filter(event => {
    const eventId = event.id || event.title || event.date
    const eventTitle = event.title?.toLowerCase()
    return !recentLastThree.includes(eventId) && !recentLastThreeTitles.includes(eventTitle)
  })
  
  if (olderEvents.length > 0) {
    const selected = olderEvents[Math.floor(Math.random() * olderEvents.length)]
    addRecentEvent(actionType, selected.id || selected.title || selected.date, selected.title)
    return selected
  }
  
  // Last resort: any event from candidates
  const selected = candidates[Math.floor(Math.random() * candidates.length)]
  addRecentEvent(actionType, selected.id || selected.title || selected.date, selected.title)
  return selected
}