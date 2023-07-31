const path = require('path');

const { download } = require('../libs/fetch');
const config = require('./config');

download(
  `${config.devUrl}/schema.json`,
  // eslint-disable-next-line no-undef
  path.join(__dirname, '../../apps/main/public/schema.json'),
);
