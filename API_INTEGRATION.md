# Historical Events API Integration

HistoriSnap now uses Wikipedia's "On This Day" API to fetch real historical events while maintaining our custom data structure.

## API Implementation

### Data Source Hierarchy:
1. **Primary**: Wikipedia "On This Day" API 
2. **Secondary**: Local events for the same date
3. **Tertiary**: Random local event (guaranteed fallback)
4. **Error Handling**: Always ensures at least one event is returned

### Guaranteed Event Policy:
✅ **Never returns empty results** - Users always see an event
- API events for selected date → Local events for date → Random local event
- Handles API failures, network issues, and dates with no events
- Multiple fallback layers ensure reliability

### API Endpoints Used:
- **Date-specific events**: `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/{MM}/{DD}`
- **Random events**: Random date selection + API call

### Data Structure Maintained:
```javascript
{
  id: "wiki_timestamp_index",
  date: "Month Day, Year",
  title: "Event Title",
  description: "Event description from Wikipedia",
  image: "Categorized Unsplash image URL",
  categories: ["Auto-categorized", "Based on content"],
  year: 1969,
  month: 7,
  day: 20,
  quickFacts: [
    { title: "Year", description: "1969" },
    { title: "Source", description: "Wikipedia" },
    { title: "Category", description: "Space" }
  ]
}
```

### Features:
- ✅ **Auto-categorization** - Events are categorized based on content analysis
- ✅ **Image mapping** - Relevant Unsplash images based on categories with error handling
- ✅ **Date filtering** - Supports year, month, day filtering with correct date preservation
- ✅ **Error resilience** - Always falls back to local data
- ✅ **Performance** - Limits API results to 10 events per request
- ✅ **Mixed results** - Combines API and local events for richer content
- ✅ **Date consistency** - Wikipedia events show correct selected date, not current date
- ✅ **HTTPS endpoints** - All APIs use secure HTTPS connections
- ✅ **Image fallbacks** - Automatic fallback images if primary images fail to load

### Categories Supported:
- War/Military, Space/Technology, Politics/Government
- Science/Discovery, Music/Culture, Rights/Social
- Disaster/Tragedy, Ancient/History, Aviation/Technology

## Usage
The API integration is transparent to users. When they select a date or click "Random Event", the app:
1. Tries to fetch from Wikipedia API
2. Transforms the data to our structure
3. Falls back to local events if needed
4. Always provides a consistent user experience

No API keys required - uses Wikipedia's free, public API.