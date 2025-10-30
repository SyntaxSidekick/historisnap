import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Button
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  Search as SearchIcon,
  TouchApp as ClickIcon,
  Category as CategoryIcon,
  Schedule as TimeIcon,
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  Psychology as BrainIcon
} from '@mui/icons-material'
import { getLearningInsights, exportAnalyticsData } from '../services/historicalEventsAPI'

const LearningInsights = ({ onClose }) => {
  const [insights, setInsights] = useState(() => getLearningInsights())
  const [expanded, setExpanded] = useState('overview')

  const handleRefresh = () => {
    setInsights(getLearningInsights())
  }

  const handleExport = () => {
    const data = exportAnalyticsData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historisnap-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`
  
  const getDataQualityColor = (score) => {
    if (score >= 75) return 'success'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getRecommendationSeverity = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'info'
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <BrainIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight={600}>
            Learning Insights
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export analytics data">
            <IconButton onClick={handleExport} color="secondary">
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Overview Stats */}
      <Accordion 
        expanded={expanded === 'overview'} 
        onChange={() => setExpanded(expanded === 'overview' ? null : 'overview')}
      >
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <AnalyticsIcon sx={{ mr: 2 }} />
          <Typography variant="h6">System Overview</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            {/* Data Quality Score */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Learning Data Quality
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <LinearProgress
                    variant="determinate"
                    value={insights.dataQuality}
                    color={getDataQualityColor(insights.dataQuality)}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="h6" color={`${getDataQualityColor(insights.dataQuality)}.main`}>
                    {insights.dataQuality}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Quality improves as you search and interact more
                </Typography>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SearchIcon color="primary" />
                    <Typography variant="h4">{insights.totalInteractions}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Total Interactions
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ClickIcon color="success" />
                    <Typography variant="h4">{formatPercentage(insights.conversionRate)}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Click-through Rate
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TimeIcon color="info" />
                    <Typography variant="h4">{Math.round(insights.avgTimeSpent / 1000)}s</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Time per Event
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Popular Searches */}
      <Accordion 
        expanded={expanded === 'searches'} 
        onChange={() => setExpanded(expanded === 'searches' ? null : 'searches')}
      >
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <TrendingIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Popular Searches</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {insights.topQueries.slice(0, 5).map(([query, data], index) => (
              <ListItem key={query} divider={index < 4}>
                <ListItemIcon>
                  <Chip 
                    label={`#${index + 1}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </ListItemIcon>
                <ListItemText
                  primary={query}
                  secondary={`${data.count} searches • ${formatPercentage(data.clickRate)} click rate`}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Category Preferences */}
      <Accordion 
        expanded={expanded === 'categories'} 
        onChange={() => setExpanded(expanded === 'categories' ? null : 'categories')}
      >
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <CategoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Your Interests</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {insights.topCategories.slice(0, 8).map(([category, count]) => (
              <Chip
                key={category}
                label={`${category} (${count})`}
                variant="outlined"
                color="secondary"
                size="medium"
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Accordion 
          expanded={expanded === 'recommendations'} 
          onChange={() => setExpanded(expanded === 'recommendations' ? null : 'recommendations')}
        >
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <BrainIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Recommendations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {insights.recommendations.map((rec, index) => (
                <Alert 
                  key={index} 
                  severity={getRecommendationSeverity(rec.priority)}
                  variant="outlined"
                >
                  {rec.message}
                </Alert>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Usage Patterns */}
      <Accordion 
        expanded={expanded === 'patterns'} 
        onChange={() => setExpanded(expanded === 'patterns' ? null : 'patterns')}
      >
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <TimeIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Usage Patterns</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Peak search hours:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {insights.peakHours.map(([hourKey, count]) => {
                const hour = parseInt(hourKey.split('_')[1])
                const timeLabel = hour === 0 ? '12 AM' : 
                                hour < 12 ? `${hour} AM` : 
                                hour === 12 ? '12 PM' : `${hour - 12} PM`
                return (
                  <Chip
                    key={hourKey}
                    label={`${timeLabel} (${count})`}
                    size="small"
                    variant="outlined"
                  />
                )
              })}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Close Button */}
      <Box mt={3} display="flex" justifyContent="center">
        <Button 
          variant="contained" 
          onClick={onClose}
          size="large"
          sx={{ minWidth: 200 }}
        >
          Close Insights
        </Button>
      </Box>
    </Box>
  )
}

export default LearningInsights