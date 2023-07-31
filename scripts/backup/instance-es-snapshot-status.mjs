import { getSnapshotStatus } from './es-bak.js';

const ES_DEV_ENDPOINT =
  'search-dev-mb-os-domain-gszapqmdqz3uhpa4gueocs3754.ap-southeast-2.es.amazonaws.com';

const res = await getSnapshotStatus({ domain: ES_DEV_ENDPOINT });
console.log(
  '@scripts_backup_create_instance_es_data_mjs::',
  'res',
  JSON.stringify(res.status),
); //TRACE
