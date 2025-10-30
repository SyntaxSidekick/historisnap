import { createContext, useState, useEffect } from 'react'
import { createTheme } from '@mui/material/styles'

export const ThemeContext = createContext()

// Light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8', // Google Blue
      dark: '#1557b0',
      light: '#4285f4',
    },
    secondary: {
      main: '#137333', // Google Green
      dark: '#0d652d',
      light: '#34a853',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    surface: {
      main: '#ffffff',
      variant: '#f8f9fa',
    },
    text: {
      primary: '#1f1f1f',
      secondary: '#5f6368',
    },
    divider: '#dadce0',
    grey: {
      50: '#f8f9fa',
      100: '#f1f3f4',
      200: '#e8eaed',
      300: '#dadce0',
      400: '#bdc1c6',
      500: '#9aa0a6',
      600: '#80868b',
      700: '#5f6368',
      800: '#3c4043',
      900: '#202124',
    },
  },
  typography: {
    fontFamily: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h2: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h3: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h4: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h5: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h6: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    body1: {
      fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
    },
    body2: {
      fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#dadce0',
            },
            '&:hover fieldset': {
              borderColor: '#1a73e8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a73e8',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Google doesn't use all caps
          fontWeight: 500,
          borderRadius: 8,
          '&.MuiButton-contained': {
            backgroundColor: '#1a73e8',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1557b0',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#dadce0',
            color: '#1f1f1f',
            '&:hover': {
              borderColor: '#1a73e8',
              backgroundColor: 'rgba(26, 115, 232, 0.04)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f9fa',
          color: '#1f1f1f',
          '&:hover': {
            backgroundColor: '#e8eaed',
          },
        },
      },
    },
  },
})

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8ab4f8', // Google Blue for dark mode
      dark: '#5f9df7',
      light: '#aecbfa',
    },
    secondary: {
      main: '#81c995', // Google Green for dark mode
    },
    background: {
      default: '#0f0f0f', // Google's dark surface
      paper: '#1a1a1a',
    },
    surface: {
      main: '#1a1a1a',
      variant: '#2a2a2a',
    },
    text: {
      primary: '#e3e3e3',
      secondary: '#9aa0a6',
    },
    divider: '#333638',
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#424242',
      400: '#5f6368',
      500: '#616161',
      600: '#757575',
      700: '#424242',
      800: '#333333',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h2: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h3: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h4: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h5: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    h6: {
      fontFamily: ['Google Sans', 'Arial', 'sans-serif'].join(','),
    },
    body1: {
      fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
    },
    body2: {
      fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#3c4043',
            },
            '&:hover fieldset': {
              borderColor: '#4285f4',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4285f4',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333638',
          color: '#e3e3e3',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderColor: '#333638',
          color: '#e3e3e3',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderColor: '#333638',
          color: '#e3e3e3',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          color: '#e3e3e3',
          '&:hover': {
            backgroundColor: '#333638',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Google doesn't use all caps
          fontWeight: 500,
          borderRadius: 8,
          '&.MuiButton-outlined': {
            borderColor: '#333638',
            color: '#e3e3e3',
            '&:hover': {
              borderColor: '#8ab4f8',
              backgroundColor: 'rgba(138, 180, 248, 0.1)',
            },
          },
          '&.MuiButton-contained': {
            backgroundColor: '#8ab4f8',
            color: '#0f0f0f',
            '&:hover': {
              backgroundColor: '#aecbfa',
            },
          },
        },
      },
    },
  },
})

export const CustomThemeProvider = ({ children }) => {
  // Check localStorage for saved theme preference or default to light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('historisnap-theme')
    return savedTheme === 'dark'
  })

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('historisnap-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const currentTheme = isDarkMode ? darkTheme : lightTheme

  const contextValue = {
    isDarkMode,
    toggleTheme,
    theme: currentTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}