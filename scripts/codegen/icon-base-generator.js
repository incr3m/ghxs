// dev cmd: nodemon -w scripts --exec yarn codegen
const fs = require('fs');
const path = require('path');

const IGNORED_FILES = [
  'icons.stories.tsx',
  'icon.type.ts',
  'gradient',
  'iconography',
  '.DS_Store',
];
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

import Grid from '@mui/material/Grid';
import { Box, Typography } from '@mui/material';
import IconGridHolder from './IconGridHolder';

${icons.map(icon => `import ${icon} from '../${icon}';`).join(NEW_LINE)}

export default {
  title: 'Icons/Iconography',
};

export const Iconography = () => {
  return (
  <Box>
    <Typography component="h1" variant="button">Click the icon to copy the code</Typography>
    <Grid mt={1} container spacing={2} sx={{ '.MuiGrid-item': { display: 'flex', alignItems: 'center' }, '.MuiTypography-caption': { pl: 2 } }}>
      ${icons
        .map(icon => {
          return `<IconGridHolder icon={<${icon} />} iconName="${icon}" />`;
        })
        .join(NEW_LINE)}
    </Grid>
  </Box>
  );
};`;
  },
};
