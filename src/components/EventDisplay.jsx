import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  IconButton,
  Button,
  Paper,
  CircularProgress,
  Fade,
  Tooltip
} from '@mui/material'
import { 
  Share, 
  Bookmark, 
  BookmarkBorder, 
  OpenInNew,
  SearchOff,
  ErrorOutline,
  ZoomIn,
  PlayArrow,
  CloudDownload,
  Storage
} from '@mui/icons-material'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import ImageModal from './ImageModal'
import VideoPlayer from './VideoPlayer'
import { getImageWithFallbacks, validateImageUrl } from '../services/imageService'
import { getEventMultimedia, hasMultimediaContent } from '../services/multimediaService'

const EventDisplay = memo(({ event, loading }) => {
  const [bookmarked, setBookmarked] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false)
  const [multimediaContent, setMultimediaContent] = useState(null)
  const [multimediaLoading, setMultimediaLoading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [fallbackImages, setFallbackImages] = useState([])
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0)
  
  // Load multimedia content when event changes
  useEffect(() => {
    const loadMultimedia = async () => {
      if (!event) {
        setMultimediaContent(null)
        return
      }

      setMultimediaLoading(true)
      try {
        const multimedia = await getEventMultimedia(event)
        setMultimediaContent(multimedia)
        console.log('Multimedia loaded for', event.title, multimedia)
      } catch (error) {
        console.warn('Failed to load multimedia:', error)
        setMultimediaContent(null)
      } finally {
        setMultimediaLoading(false)
      }
    }

    loadMultimedia()
  }, [event])
  
  // Get all fallback images when event changes
  useEffect(() => {
    const loadImageOptions = async () => {
      if (!event) return
      
      setImageLoading(true)
      setCurrentFallbackIndex(0)
      
      try {
        // Get all possible images for this event
        const imageOptions = await getImageWithFallbacks(event.categories, event.image)
        setFallbackImages(imageOptions)
        
        // Try to validate and set the first working image
        for (let i = 0; i < imageOptions.length; i++) {
          const imageUrl = imageOptions[i]
          
          // For data URLs (base64), assume they work
          if (imageUrl.startsWith('data:')) {
            setCurrentImageUrl(imageUrl)
            setCurrentFallbackIndex(i)
            setImageLoading(false)
            return
          }
          
          // Validate external URLs
          try {
            const isValid = await validateImageUrl(imageUrl, 3000)
            if (isValid) {
              setCurrentImageUrl(imageUrl)
              setCurrentFallbackIndex(i)
              setImageLoading(false)
              return
            }
          } catch (error) {
            console.log(`Image validation failed for ${imageUrl}:`, error)
          }
        }
        
        // If all external images failed, use the last one (should be base64 fallback)
        const lastImage = imageOptions[imageOptions.length - 1]
        setCurrentImageUrl(lastImage)
        setCurrentFallbackIndex(imageOptions.length - 1)
        setImageLoading(false)
        
      } catch (error) {
        console.error('Error loading image options:', error)
        // Ultimate fallback - base64 image
        const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4gICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4gICAgPC9saW5lYXJHcmFkaWVudD4gIDwvZGVmcz4gIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+ICA8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGlzdG9yaWNhbCBFdmVudDwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+'
        setCurrentImageUrl(defaultImage)
        setFallbackImages([defaultImage])
        setCurrentFallbackIndex(0)
        setImageLoading(false)
      }
    }
    
    loadImageOptions()
  }, [event])
  
  // Handle image error by trying next fallback
  const handleImageError = useCallback(async () => {
    console.log(`Image failed to load: ${currentImageUrl}`)
    
    if (currentFallbackIndex < fallbackImages.length - 1) {
      const nextIndex = currentFallbackIndex + 1
      const nextImage = fallbackImages[nextIndex]
      
      // For data URLs, use immediately
      if (nextImage.startsWith('data:')) {
        setCurrentImageUrl(nextImage)
        setCurrentFallbackIndex(nextIndex)
        return
      }
      
      // Validate next external image
      try {
        const isValid = await validateImageUrl(nextImage, 2000)
        if (isValid) {
          setCurrentImageUrl(nextImage)
          setCurrentFallbackIndex(nextIndex)
          return
        }
      } catch (error) {
        console.log(`Next image validation failed:`, error)
      }
      
      // If validation failed, try the next one
      setCurrentFallbackIndex(nextIndex)
      handleImageError()
    } else {
      // All images failed, use final base64 fallback
      const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxkZWZzPiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4gICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4gICAgPC9saW5lYXJHcmFkaWVudD4gIDwvZGVmcz4gIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+ICA8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGlzdG9yaWNhbCBFdmVudDwvdGV4dD4gIDx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+'
      setCurrentImageUrl(defaultImage)
    }
  }, [currentImageUrl, currentFallbackIndex, fallbackImages])
  
  // Memoize event handlers to prevent child re-renders
  const handleShare = useCallback(() => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title,
        text: `${event.description.substring(0, 100)}...`,
        url: window.location.href
      })
    } else if (event) {
      const shareText = `${event.title}\n${event.date}\n\n${event.description}\n\nDiscovered on HistoriSnap: ${window.location.href}`
      navigator.clipboard.writeText(shareText)
    }
  }, [event])

  const handleBookmark = useCallback(() => {
    setBookmarked(prev => !prev)
  }, [])

  const handleLearnMore = useCallback(() => {
    if (event) {
      const searchQuery = encodeURIComponent(event.title)
      const url = `https://en.wikipedia.org/wiki/Special:Search/${searchQuery}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [event])

  const handleImageModalOpen = useCallback(() => {
    setImageModalOpen(true)
  }, [])

  const handleImageModalClose = useCallback(() => {
    setImageModalOpen(false)
  }, [])
  
  // Memoize expensive computations
  const categoriesDisplay = useMemo(() => {
    if (!event?.categories || event.categories.length === 0) return null
    
    return event.categories.slice(0, 3).map((category, index) => (
      <Tooltip key={index} title={`This event is categorized under: ${category}. Click to explore similar events.`} placement="top" arrow>
        <Chip
          label={category}
          size="medium"
          sx={{
            backgroundColor: 'primary.50',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'primary.100'
            }
          }}
        />
      </Tooltip>
    ))
  }, [event?.categories])

  // Memoize loading state with skeleton
  const loadingContent = useMemo(() => (
    <Card
      elevation={2}
      sx={{
        maxWidth: 800,
        mx: 'auto',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Skeleton Image */}
      <Box
        sx={{
          width: '100%',
          height: '300px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
          '@keyframes loading': {
            '0%': {
              backgroundPosition: '200% 0'
            },
            '100%': {
              backgroundPosition: '-200% 0'
            }
          }
        }}
      />
      
      {/* Skeleton Content */}
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '80px',
                height: '16px',
                bgcolor: 'grey.300',
                borderRadius: 1,
                mb: 0.5
              }}
            />
            <Box
              sx={{
                width: '120px',
                height: '14px',
                bgcolor: 'grey.200',
                borderRadius: 1
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'grey.200' }} />
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'grey.200' }} />
          </Box>
        </Box>
        
        <Box
          sx={{
            width: '90%',
            height: '32px',
            bgcolor: 'grey.300',
            borderRadius: 1,
            mb: 2
          }}
        />
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ width: '100%', height: '16px', bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
          <Box sx={{ width: '95%', height: '16px', bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
          <Box sx={{ width: '80%', height: '16px', bgcolor: 'grey.200', borderRadius: 1 }} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ width: '60px', height: '24px', bgcolor: 'grey.200', borderRadius: 2 }} />
          <Box sx={{ width: '80px', height: '24px', bgcolor: 'grey.200', borderRadius: 2 }} />
          <Box sx={{ width: '70px', height: '24px', bgcolor: 'grey.200', borderRadius: 2 }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Searching through history...
          </Typography>
        </Box>
      </CardContent>
    </Card>
  ), [])

  // Memoize no event content
  const noEventContent = useMemo(() => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 400,
        gap: 2
      }}
    >
      <SearchOff sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.primary">
        No historical events found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Try a different date or click "Random Event"
      </Typography>
    </Box>
  ), [])

  if (loading) {
    return loadingContent
  }

  if (!event) {
    return noEventContent
  }



  return (
    <Fade in={!loading} timeout={600}>
      <Card
        elevation={2}
        sx={{
          maxWidth: 800,
          mx: 'auto',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Image with tooltip */}
        <Tooltip title="Click to view full-size image with zoom and download options" placement="top" arrow>
          <Box
            sx={{ 
              position: 'relative', 
              cursor: 'pointer',
              overflow: 'hidden',
              '&:hover .zoom-overlay': {
                opacity: 1
              }
            }}
            onClick={handleImageModalOpen}
          >
            {imageLoading ? (
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <CircularProgress size={40} sx={{ color: 'white' }} />
              </Box>
            ) : currentImageUrl ? (
              <Box
                component="img"
                src={currentImageUrl}
                alt={event.title}
                onError={handleImageError}
                sx={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '500',
                  textAlign: 'center',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <SearchOff style={{ fontSize: '48px', opacity: 0.7 }} />
                <div>Historical Image</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {event.categories?.[0] || 'Historical Event'}
                </div>
              </Box>
            )}
            
            {/* Video/Audio Overlay (for events with multimedia) */}
            {(event.video || event.audio || (multimediaContent && hasMultimediaContent(multimediaContent))) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '14px',
                  fontWeight: '500',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: event.audio ? 'rgba(0, 150, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)',
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoPlayerOpen(true);
                }}
              >
                <PlayArrow sx={{ fontSize: '18px' }} />
                {multimediaLoading ? 'Loading...' : 
                 (event.audio ? 'Listen Audio' :
                  event.video || multimediaContent?.videos?.length > 0 ? 'Watch Video' : 
                  multimediaContent?.audio?.length > 0 ? 'Listen Audio' : 'Play Media')}
              </Box>
            )}
            
            {/* Zoom Overlay */}
            <Box
              className="zoom-overlay"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
                backdropFilter: 'blur(4px)'
              }}
            >
              <ZoomIn />
            </Box>
          </Box>
        </Tooltip>
        
        {/* Content container with padding */}
        <CardContent sx={{ p: 3 }}>
          {/* Header with date and action buttons */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              mb: 2
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontSize: '13px',
                  fontWeight: 500,
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {event.source || 'Historical Event'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '14px',
                  fontWeight: 400
                }}
              >
                {event.date}
              </Typography>
              
              {/* Data Source Indicator */}
              {event.dataSource && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {event.dataSource.includes('API') ? (
                    <CloudDownload sx={{ fontSize: '12px', color: 'success.main' }} />
                  ) : (
                    <Storage sx={{ fontSize: '12px', color: 'info.main' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: event.dataSource.includes('API') ? 'success.main' : 'info.main',
                      fontSize: '11px',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {event.dataSource}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Share this historical event via social media or copy to clipboard" placement="top" arrow>
                <IconButton 
                  onClick={handleShare}
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      color: 'primary.main'
                    }
                  }}
                >
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={bookmarked ? "Remove from bookmarks" : "Save this event to your bookmarks"} placement="top" arrow>
                <IconButton 
                  onClick={handleBookmark}
                  size="small"
                  sx={{ 
                    color: bookmarked ? 'primary.main' : 'text.secondary',
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      color: 'primary.main'
                    }
                  }}
                >
                  {bookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: '24px', md: '28px' },
              fontWeight: 400,
              color: 'text.primary',
              lineHeight: 1.3,
              mb: 2
            }}
          >
            {event.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              fontSize: '16px',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            {event.description}
          </Typography>

          {/* Categories and Learn More button inline */}
          {categoriesDisplay ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1 }}>
                {categoriesDisplay}
              </Box>
              
              <Tooltip title="Opens Wikipedia search in a new tab for detailed information about this event" placement="top" arrow>
                <Button
                  variant="outlined"
                  onClick={handleLearnMore}
                  endIcon={<OpenInNew />}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    flexShrink: 0,
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  Learn more on Wikipedia
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ mb: 4 }}>
              <Tooltip title="Opens Wikipedia search in a new tab for detailed information about this event" placement="top" arrow>
                <Button
                  variant="outlined"
                  onClick={handleLearnMore}
                  endIcon={<OpenInNew />}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  Learn more on Wikipedia
                </Button>
              </Tooltip>
            </Box>
          )}
        </CardContent>

        {/* Image Modal */}
        <ImageModal
          open={imageModalOpen}
          onClose={handleImageModalClose}
          event={event}
          imageUrl={currentImageUrl}
        />
        
        {/* Video Player */}
        {(event?.video || event?.audio || (multimediaContent && hasMultimediaContent(multimediaContent))) && (
          <VideoPlayer
            open={videoPlayerOpen}
            onClose={() => setVideoPlayerOpen(false)}
            video={event?.video || multimediaContent?.videos?.[0]}
            audio={event?.audio || multimediaContent?.audio?.[0]}
            multimedia={multimediaContent}
            eventTitle={event?.title}
          />
        )}
      </Card>
    </Fade>
  )
})

EventDisplay.displayName = 'EventDisplay'

export default EventDisplay