import { create } from '@storybook/theming';
import { addons } from '@storybook/addons';

const embraceTheme = create({
  base: 'light',
  brandTitle: 'Embrace Storybook',
  brandUrl: 'https://embrace.technology',
  brandImage: 'https://embrace.technology/assets_c/images/logo.png',
  brandTarget: '_self',
});

addons.setConfig({
  theme: embraceTheme,
});
