const { backfill } = require('./../common/back-filler');

// const TABLE_NAME = process.env.TABLE_NAME;

// const appId = process.env.APP_ID;
// const tableName = `${TABLE_NAME}Table`;
const appId = '4uwanpq2azbgfaykydjxn6vaaq';
const tableName = 'IntervalTable';

// function updater(rec) {
// console.log('>>backfill-billables/index::', 'args', rec); //TRACE
function updater() {
  return {
    ExpressionAttributeValues: {
      ':b': {
        BOOL: true
      }
    },
    UpdateExpression: 'SET billable = :b'
  };
}

backfill(appId, tableName, updater)
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
