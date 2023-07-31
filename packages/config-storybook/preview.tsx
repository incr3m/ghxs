import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Preview } from '@storybook/react';
import { theme } from '@mb-embrace/config-mui';

export const baseStorybookPreview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      // Description toggle
      // expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  decorators: [
    Story => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};
