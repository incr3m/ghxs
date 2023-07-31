// npx zx <cmd>
import { $$ } from '../common/zx.js';

const [instanceCode] = process.argv.slice(3);

process.env.VITE_APP_INSTANCE_CODE = instanceCode;

process.env.FORCE_COLOR = '1';
await $$`yarn start`;
