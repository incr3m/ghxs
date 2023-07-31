import * as url from 'url';
import path from 'path';
import { download } from '../libs/fetch.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const [domain] = process.argv.slice(2);

const cfgKey = domain.replace('https://', '').replace(/\./g, '-');

await download(
  'https://mbstg.embrace.technology/mbstg-embrace-technology.json',
  path.join(__dirname, `../../apps/main/build/${cfgKey}.json`),
);

await download(
  'https://mbstg.embrace.technology/schema.json',
  path.join(__dirname, '../../apps/main/build/schema.json'),
);
