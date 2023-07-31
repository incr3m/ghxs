import { copyTableItems } from './copy-table-items.js';

await copyTableItems(
  {
    profile: 'mb-jim',
    region: 'ap-southeast-2',
    tableName: 'Resource-4z2bbl35sjexfmjimqumrkjzey-dev',
  },
  {
    profile: 'mb-jim',
    region: 'ap-southeast-2',
    tableName: 'Resource-5gafj74a3ndhxgvxte6zaywk4q-stg',
  },
);
