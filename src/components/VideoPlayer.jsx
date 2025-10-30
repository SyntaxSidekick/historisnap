import { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack,
  Tooltip
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  OpenInNew as ExternalIcon,
  VolumeUp as AudioIcon
} from '@mui/icons-material'

const VideoPlayer = ({ video, audio, eventTitle, onVideoPlay, open, onClose, multimedia }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)

  // Use external open state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen
  const handleDialogClose = onClose || (() => setIsOpen(false))
  
  // Set initial selected media when dialog opens
  useEffect(() => {
    if (dialogOpen && !selectedMedia) {
      if (video) {
        setSelectedMedia(video)
      } else if (audio) {
        setSelectedMedia(audio)
      } else if (multimedia?.videos?.length > 0) {
        setSelectedMedia(multimedia.videos[0])
      } else if (multimedia?.audio?.length > 0) {
        setSelectedMedia(multimedia.audio[0])
      }
    }
  }, [dialogOpen, video, audio, multimedia, selectedMedia])

  // Check if we have any media to display
  const hasMedia = selectedMedia?.youtubeId || video?.youtubeId || audio?.youtubeId ||
                   multimedia?.videos?.length > 0 || multimedia?.audio?.length > 0

  if (!hasMedia) {
    return null
  }

  const currentMedia = selectedMedia || video || audio
  
  // Additional safety check - ensure we have a valid YouTube ID
  const mediaId = currentMedia?.youtubeId || video?.youtubeId || audio?.youtubeId
  if (!mediaId) {
    console.warn('VideoPlayer: No valid YouTube ID found', { currentMedia, video, audio, multimedia })
    return null
  }

  const handlePlayClick = () => {
    setIsOpen(true)
    if (onVideoPlay) {
      onVideoPlay(currentMedia)
    }
  }

  const handleOpenInYouTube = () => {
    if (mediaId) {
      window.open(`https://www.youtube.com/watch?v=${mediaId}`, '_blank')
    }
  }

  const embedUrl = `https://www.youtube.com/embed/${mediaId}?autoplay=1&rel=0&modestbranding=1`

  return (
    <>
      {/* Play Button Overlay */}
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 4
          }
        }}
        onClick={handlePlayClick}
      >
        {/* Video Thumbnail with Play Button */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              borderRadius: 2
            }}
          >
            <IconButton
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                width: 64,
                height: 64,
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <PlayIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
          
          {/* Video Info Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              zIndex: 2
            }}
          >
            <Stack spacing={1}>
              <Chip
                label="📺 Historic Video"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'primary.main',
                  fontWeight: 600,
                  alignSelf: 'flex-start'
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  padding: '4px 8px',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                Click to play the actual video
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Video Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(currentMedia?.type === 'audio' || audio) && (
                <AudioIcon sx={{ color: 'primary.main', fontSize: '20px' }} />
              )}
              <Typography variant="h6" component="div">
                {currentMedia?.title || video?.title || audio?.title || eventTitle}
              </Typography>
            </Box>
            {(currentMedia?.description || video?.description || audio?.description) && (
              <Typography variant="body2" color="text.secondary">
                {currentMedia?.description || video?.description || audio?.description}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {/* YouTube Embed */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 0,
              paddingBottom: '56.25%', // 16:9 aspect ratio
              backgroundColor: 'black'
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentMedia?.title || video?.title || audio?.title || eventTitle || 'Historical Media'}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Tooltip title="Open in YouTube">
            <Button
              startIcon={<ExternalIcon />}
              onClick={handleOpenInYouTube}
              variant="outlined"
            >
              Watch on YouTube
            </Button>
          </Tooltip>
          <Button onClick={handleDialogClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default VideoPlayer