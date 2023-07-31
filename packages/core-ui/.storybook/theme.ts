import { create } from '@storybook/theming';
import { getVersionInfo } from '@mb-embrace/utils-version';

export const theme = create({
  base: 'light',
  brandTitle: `Turborepo Boilerplate - UI ${getVersionInfo()}`,
  brandUrl: 'https://github.com/mkosir/turborepo-boilerplate',
});
