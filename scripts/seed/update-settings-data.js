process.env.API_URL =
  'https://n7yzlnqiz5ag7krlsgojb5rqp4.appsync-api.ap-southeast-2.amazonaws.com/graphql';
process.env.API_KEY = 'da2-xxx';
process.env.API_ID = 'hmbj3prbcjgqhivdtj2yaq7yi4';
process.env.ENV = 'prod';
process.env.REGION = 'ap-southeast-2';

const _ = require('lodash');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { client, esQueryReq } = require('../libs/appsync');

const dynamoDB = new AWS.DynamoDB({
  region: process.env.REGION,
});

function getTableName(model) {
  return `${model}-${process.env.API_ID}-${process.env.ENV}`;
}

function writeToDataFile(name, data) {
  fs.writeFileSync(
    // eslint-disable-next-line no-undef
    path.join(__dirname, 'data', name),
    JSON.stringify(data, null, 4),
  );
}

async function updateSettings() {
  const settingsTable = getTableName('Setting');

  let nextToken;
  const settingsItems = [];

  do {
    const res = await dynamoDB
      .scan({ TableName: settingsTable, ExclusiveStartKey: nextToken })
      .promise();
    console.log('>>seed/update-settings-data::', 'res.Items', res.Items); //TRACE
    res.Items.forEach(raw => {
      const item = AWS.DynamoDB.Converter.unmarshall(raw);
      settingsItems.push(item);
    });
    nextToken = res.LastEvaluatedKey;
    console.log('>>seed/update-settings-data::', 'res', res); //TRACE
  } while (nextToken);

  const sorted = _.sortBy(settingsItems, 'id');
  console.log('>>seed/update-settings-data::', 'sorted', sorted.length); //TRACE
  writeToDataFile('setting.json', sorted);
}

async function updateAdminProject() {
  const [projectQ, tasksQ] = await Promise.all([
    client.query(
      esQueryReq({
        index: 'project',
        body: {
          size: 1,
          query: {
            bool: {
              must: { term: { 'id.keyword': 'bfeb1c16-06e0-488f-ba0f-2924ee3f881b' } },
            },
          },
        },
      }),
    ),
    client.query(
      esQueryReq({
        index: 'task',
        body: {
          size: 999,
          query: {
            bool: {
              must: {
                term: { 'projectId.keyword': 'bfeb1c16-06e0-488f-ba0f-2924ee3f881b' },
              },
            },
          },
        },
      }),
    ),
  ]);

  const projectData = JSON.parse(projectQ.data.q);
  const project = projectData.hits.hits[0]._source;

  const tasksData = JSON.parse(tasksQ.data.q);
  const taskSources = tasksData.hits.hits;
  console.log('>>seed/update-settings-data::', 'tasks', taskSources.length); //TRACE

  const refDate = new Date();
  project.createdAt = refDate.toISOString();
  project.updatedAt = project.createdAt;
  delete project.createdBy;
  delete project.updatedBy;

  const adminProjectData = [project];

  for (const { _source } of taskSources) {
    delete _source.taskSprintId;
    delete _source.createdBy;
    delete _source.updatedBy;
    _source.status = 'IDLE';
    _source.createdAt = refDate.toISOString();
    _source.updatedAt = _source.createdAt;
    adminProjectData.push(_source);
  }

  console.log('>>seed/update-settings-data::', 'adminProjectData', adminProjectData); //TRACE
  writeToDataFile('admin-project.json', adminProjectData);
}

async function main() {
  await updateSettings();
  await updateAdminProject();
}

main();
