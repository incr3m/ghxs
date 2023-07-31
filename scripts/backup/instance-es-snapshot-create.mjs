import { createSnapshot } from './es-bak.js';

const ES_DEV_ENDPOINT =
  'search-es-dev-bjf2s5pzbamaolmmgewauisf2e.ap-southeast-2.es.amazonaws.com';

const res = await createSnapshot({
  domain: ES_DEV_ENDPOINT,
  indices: '*vb63a3crvra6ni2pldzbn6iimy-dev',
  name: 'xxx-demo-20221230',
});

console.log('@scripts_backup_create_instance_es_data_mjs::', 'res', res); //TRACE

// console.log('@scripts_backup_create_instance_es_data_mjs::1'); //TRACE
// const res = await getSnapshotStatus({ domain: ES_DEV_ENDPOINT });
// console.log('@scripts_backup_create_instance_es_data_mjs::', 'res', res); //TRACE
