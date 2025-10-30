import { 
  Modal, 
  Box, 
  IconButton, 
  Typography, 
  Fade,
  Backdrop,
  Button,
  Chip,
  Stack
} from '@mui/material'
import { 
  Close, 
  Download, 
  Share, 
  ZoomIn, 
  ZoomOut, 
  Fullscreen,
  OpenInNew,
  Info
} from '@mui/icons-material'
import { useState, useEffect, useCallback } from 'react'

const ImageModal = ({ open, onClose, event, imageUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showInfo, setShowInfo] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setImageLoaded(false)
      setZoom(1)
      setShowInfo(false)
      setImageError(false)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!open) return
    
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'i':
      case 'I':
        setShowInfo(prev => !prev)
        break
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + 0.2, 3))
        break
      case '-':
        setZoom(prev => Math.max(prev - 0.2, 0.5))
        break
      case '0':
        setZoom(1)
        break
      default:
        break
    }
  }, [open, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${event?.title?.replace(/[^a-z0-9]/gi, '_') || 'historical_event'}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Historical Event',
          text: event?.description || 'Check out this historical event!',
          url: window.location.href
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const openInNewTab = () => {
    window.open(imageUrl, '_blank')
  }

  if (!event) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: { 
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(4px)'
          }
        }
      }}
    >
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            outline: 'none'
          }}
          onClick={(e) => {
            // Close modal when clicking on backdrop (not the image)
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 1300,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Info Toggle Button */}
          <IconButton
            onClick={() => setShowInfo(prev => !prev)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: 'white',
              backgroundColor: showInfo ? 'rgba(25, 118, 210, 0.8)' : 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 1300,
              '&:hover': {
                backgroundColor: showInfo ? 'rgba(25, 118, 210, 1)' : 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <Info />
          </IconButton>

          {/* Zoom Controls */}
          <Stack
            direction="column"
            spacing={1}
            sx={{
              position: 'absolute',
              top: 80,
              right: 16,
              zIndex: 1300
            }}
          >
            <IconButton
              onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <ZoomIn />
            </IconButton>
            <IconButton
              onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <ZoomOut />
            </IconButton>
            <IconButton
              onClick={() => setZoom(1)}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <Fullscreen />
            </IconButton>
          </Stack>

          {/* Action Buttons */}
          <Stack
            direction="column"
            spacing={1}
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 16,
              zIndex: 1300
            }}
          >
            <IconButton
              onClick={handleDownload}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <Download />
            </IconButton>
            <IconButton
              onClick={handleShare}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <Share />
            </IconButton>
            <IconButton
              onClick={openInNewTab}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <OpenInNew />
            </IconButton>
          </Stack>

          {/* Main Image */}
          <Box
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!imageError ? (
              <img
                src={imageUrl}
                alt={event.title}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.2s ease-in-out',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  opacity: imageLoaded ? 1 : 0,
                  cursor: zoom < 3 ? 'zoom-in' : 'zoom-out'
                }}
                onClick={() => {
                  if (zoom < 3) {
                    setZoom(prev => Math.min(prev + 0.5, 3))
                  } else {
                    setZoom(1)
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 400,
                  height: 300,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Typography variant="h6">Image unavailable</Typography>
              </Box>
            )}
          </Box>

          {/* Event Information Panel */}
          <Fade in={showInfo} timeout={200}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: 2,
                p: 3,
                maxWidth: 600,
                mx: 'auto',
                transform: showInfo ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {event.title}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={event.date} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={event.categories?.[0] || 'Historical Event'} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
                <Chip 
                  label={event.source || 'Wikipedia'} 
                  size="small" 
                  variant="outlined" 
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {event.description}
              </Typography>

              {event.url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNew />}
                  onClick={() => window.open(event.url, '_blank')}
                >
                  Learn More
                </Button>
              )}
            </Box>
          </Fade>

          {/* Keyboard Shortcuts Help */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              textAlign: 'center',
              zIndex: 1300
            }}
          >
            Press <strong>ESC</strong> to close • <strong>I</strong> for info • <strong>+/-</strong> to zoom
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ImageModal