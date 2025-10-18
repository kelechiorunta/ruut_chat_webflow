import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import App from './App';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/custom.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme.js';
import './global.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('No #root element found in index.html');
}

const root = ReactDOM.createRoot(container);

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer />
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
