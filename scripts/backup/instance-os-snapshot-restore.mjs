import { restoreSnapshot } from './es-bak.js';

const ES_DEV_ENDPOINT =
  'search-dev-mb-os-domain-gszapqmdqz3uhpa4gueocs3754.ap-southeast-2.es.amazonaws.com';

const res = await restoreSnapshot({
  domain: ES_DEV_ENDPOINT,
  indices: '*hmbj3prbcjgqhivdtj2yaq7yi4-prod',
  name: 'xxx-prod-20221230',
});

console.log('@scripts_backup_create_instance_es_data_mjs::', 'res', res); //TRACE
