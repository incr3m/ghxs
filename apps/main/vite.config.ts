import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import graphql from '@rollup/plugin-graphql';
import eslintPlugin from '@nabla/vite-plugin-eslint';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  resolve: {
    alias: {
      // https://github.com/aws-amplify/amplify-ui/issues/268#issuecomment-953375909
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
    exclude: ['.storybook'],
    // esbuildOptions: {
    //   logLevel: 'verbose',
    // },
  },
  build: {
    outDir: 'build',
  },
  // @ts-ignore
  test: {
    globals: true,
    testTimeout: 60000,
    hookTimeout: 60000,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
  },
  server: {
    host: true,
    port: 3000,
  },
  plugins: [
    react(),
    svgr({
      exportAsDefault: true,
    }),
    tsconfigPaths({ ignoreConfigErrors: true }),
    graphql(),
    eslintPlugin({
      eslintOptions: {
        overrideConfigFile: './.eslintrc-ide.json',
      },
    }),
  ],
});
