// src/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000',
      paper: '#000'
    },
    primary: {
      main: '#bb86fc'
    },
    text: {
      primary: '#fff',
      secondary: '#bbb'
    }
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: '"Raleway", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h5: {
      fontSize: '1.2rem',
      fontWeight: 600
    },
    body2: {
      fontSize: '0.85rem'
    },
    caption: {
      fontSize: '0.75rem'
    }
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '12px !important',
          paddingRight: '12px !important'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          paddingTop: '8px',
          paddingBottom: '8px'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#1c1c1c',
            borderRadius: 8,
            fontSize: '0.85rem'
          }
        }
      }
    }
  }
});

theme = responsiveFontSizes(theme, { factor: 1.2 });

export default theme;
