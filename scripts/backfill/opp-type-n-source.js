const { backfill } = require('./../common/back-filler');

// const TABLE_NAME = process.env.TABLE_NAME;

// const appId = process.env.APP_ID;
// const tableName = `${TABLE_NAME}Table`;
const appId = 'sbkb2bntdfa6xclojpgj5uhqje';
const tableName = 'OpportunityTable';

const TYPE_MAPPING = {
  project: 'Project - Web',
  embrace: 'Embrace',
  'Project - web': 'Project - Web',
  postProject: 'Project - Web',
  support: 'Support',
  'task-list': 'Project - Web',
};

const SOURCE_MAPPING = {
  referral: 'Referral',
  client: 'Existing Client',
  website: 'Website',
  contact: 'Contact',
};

function updater(current) {
  // console.log('>>backfill/opp-type-n-source::', 'current', current); //TRACE
  if (!current) return;

  const newType = TYPE_MAPPING[current.type];
  const newSource = SOURCE_MAPPING[current.source];

  // console.log('>>backfill/opp-type-n-source::', 'newSource', newType, newSource); //TRACE

  const expValues = {};
  if (newType) expValues[':type'] = { S: newType };
  if (newSource) expValues[':source'] = { S: newSource };

  const updateKeys = [],
    attrNames = {};
  for (const key in expValues) {
    const keyName = key.replace(':', '');
    updateKeys.push(`#vv${keyName} = ${key}`);
    attrNames[`#vv${keyName}`] = keyName;
  }

  if (updateKeys.length < 1) return;

  return {
    UpdateExpression: `SET ${updateKeys.join(',')}`,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: expValues,
  };
}

backfill(appId, tableName, updater, { fields: ['type', 'source'] })
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
