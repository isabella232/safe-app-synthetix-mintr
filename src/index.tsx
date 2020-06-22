import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import theme from './theme';

import GlobalStyles from './global';
import App from './app';
import SafeContextProvider from './app/SafeProvider';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <SafeContextProvider>
      <App />
    </SafeContextProvider>
  </ThemeProvider>,
  document.getElementById('root')
);
