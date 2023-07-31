const { backfill } = require('./../common/back-filler');

// const TABLE_NAME = process.env.TABLE_NAME;

// const appId = process.env.APP_ID;
// const tableName = `${TABLE_NAME}Table`;
const appId = 'sbkb2bntdfa6xclojpgj5uhqje';
const tableName = 'CompanyTable';

// function updater(rec) {
// console.log('>>backfill-billables/index::', 'args', rec); //TRACE
function updater() {
  return {
    ExpressionAttributeValues: {
      ':b': {
        S: '8c4cef16-0d57-4009-92f4-ce8410429b7e',
      },
    },
    UpdateExpression: 'SET accountManagerId = :b',
  };
}

backfill(appId, tableName, updater)
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
