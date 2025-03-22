import { createTheme } from '@mui/material/styles';

// Create theme with light and dark mode options
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#3f51b5' : '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    // Your existing components
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark'
            ? '0 4px 12px 0 rgba(0,0,0,0.8)'
            : '0 4px 12px 0 rgba(31,38,135,0.07)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'dark' ? '#272727' : '#f0f2f5',
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 0,
          boxShadow: mode === 'dark'
            ? '0 4px 12px 0 rgba(0,0,0,0.8)'
            : '0 4px 12px 0 rgba(31,38,135,0.07)',
        }
      }
    },

    // Add Timeline component styles
    MuiTimeline: {
      styleOverrides: {
        root: {
          padding: '16px 0',
          '& .MuiTimelineContent-root': {
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTimelineContent: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          backgroundColor: mode === 'dark' ? '#272727' : '#ffffff',
          borderRadius: 8,
          boxShadow: mode === 'dark'
            ? '0 2px 8px 0 rgba(0,0,0,0.6)'
            : '0 2px 8px 0 rgba(31,38,135,0.05)',
        },
      },
    },
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          margin: 0,
          marginTop: 5,
          boxShadow: mode === 'dark'
            ? '0 2px 8px 0 rgba(0,0,0,0.6)'
            : '0 2px 8px 0 rgba(31,38,135,0.05)',
        },
        filled: {
          boxShadow: 'none',
        },
      },
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#404040' : '#e0e0e0',
        },
      },
    },
    MuiTimelineItem: {
      styleOverrides: {
        root: {
          '&:before': {
            flex: 0,
            padding: 0,
          },
        },
        missingOppositeContent: {
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiTimelineSeparator: {
      styleOverrides: {
        root: {
          minHeight: 70,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  }
});

export default createAppTheme;