const { mergeConfig } = require('vite');
const svgr = require('vite-plugin-svgr');
const tsconfigPaths = require('vite-tsconfig-paths').default;
// const graphql = require('@rollup/plugin-graphql');
const eslintPlugin = require('@nabla/vite-plugin-eslint');

const config = {
  async viteFinal(...args) {
    const [config, { configType }] = args;
    // optimize memory usage
    if (config.build) config.build.sourcemap = false;

    // return the customized config
    return mergeConfig(config, {
      // sync vite.config.ts plugins here
      resolve: {
        alias: {
          // https://github.com/aws-amplify/amplify-ui/issues/268#issuecomment-953375909
          './runtimeConfig': './runtimeConfig.browser',
        },
      },
      plugins: [
        svgr({
          exportAsDefault: true,
        }),
        tsconfigPaths({ ignoreConfigErrors: true }),
        // graphql(),
        eslintPlugin({
          eslintOptions: {
            overrideConfigFile: './.eslintrc-ide.json',
          },
        }),
      ],
    });
  },
  stories: [
    // '../src/xxx1/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/components-v2/welcome.stories.mdx',
    '../src/components-v2/**/*.stories.mdx',
    ...(process.env.NODE_ENV === 'development'
      ? ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)']
      : ['../src/components-v2/**/*.stories.@(js|jsx|ts|tsx)']),
    // '../src/**/FullCalendar.stories.tsx',
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-jest',
    '@storybook/addon-interactions',
    // '@storybook/addon-mdx-gfm',
    '@storybook/addon-mdx-gfm',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {},
  features: {
    storyStoreV7: true,
  },
  docs: {
    autodocs: true,
  },
};
module.exports = config;
