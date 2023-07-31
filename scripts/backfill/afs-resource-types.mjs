import { backfill } from './../common/back-filler.js';

const appId = 'vb63a3crvra6ni2pldzbn6iimy';
const tableName = 'ResourceTable';

function updater() {
  return {
    ExpressionAttributeNames: {
      '#key': 'type',
    },
    ExpressionAttributeValues: {
      ':b': {
        S: 'AFS_RESOURCE',
      },
    },
    UpdateExpression: 'SET #key = :b',
  };
}

await backfill(appId, tableName, updater);
console.log('done');
