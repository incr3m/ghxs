const { backfill } = require('./../common/back-filler');

// const TABLE_NAME = process.env.TABLE_NAME;

// const appId = process.env.APP_ID;
// const tableName = `${TABLE_NAME}Table`;
const appId = '6e4uobuybjfyran2n6tdq5mlf4';
const tableName = 'AllocationTable';

// function updater(rec) {
// console.log('>>backfill-billables/index::', 'args', rec); //TRACE
function updater(current) {
  console.log('>>backfill/allocation-types::', 'current', current); //TRACE
  const vars = {
    ':t': {
      S: 'Project',
    },
  };
  if (current.projectId) {
    vars[':pid'] = {
      S: current.projectId,
    };
  }
  return {
    ExpressionAttributeValues: vars,
    UpdateExpression: `SET assignType = :t${
      current.projectId ? ', assignToId = :pid' : ''
    }`,
  };
}

backfill(appId, tableName, updater, { fields: ['projectId'] })
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
