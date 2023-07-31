// dev cmd: nodemon -w scripts --exec yarn codegen
const fs = require('fs');
const path = require('path');

const IGNORED_FILES = ['icons.stories.tsx', 'icon.type.ts', 'gradient', 'iconography'];
const NEW_LINE = `
`;

module.exports = {
  plugin() {
    console.log('>>codegen/icons::', 'hello'); //TRACE

    const iconsPath = path.join(__dirname, '../../apps/main/src/icons');
    const files = fs.readdirSync(iconsPath);

    const icons = [];
    for (const file of files) {
      if (IGNORED_FILES.includes(file)) continue;
      if (file.endsWith('.stories.tsx')) continue;
      const name = file.replace('.tsx', '');
      icons.push(name);
    }

    return `
import React from 'react';

import { SvgIcon } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';

${icons.map(icon => `import ${icon} from './${icon}';`).join(NEW_LINE)}

export default {
  title: 'Icons/Embrace Icons',
  argTypes: {
    htmlColor: {
      control: {
        type: 'color',
      },
      defaultValue: '#121212',
    },
    fontSize: {
      control: { type: 'inline-radio', options: ['large', 'medium', 'small'] },
      defaultValue: 'large',
    },
  },
} as ComponentMeta<typeof SvgIcon>;

${icons
  .map(
    icon =>
      `export const _${icon}: ComponentStory<typeof SvgIcon> = args => <${icon} {...args} />;`,
  )
  .join(NEW_LINE)}
`;
  },
};
