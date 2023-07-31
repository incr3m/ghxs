const AWS = require('aws-sdk');
const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const { USER_AUTH_ATTRIB_ID, addCustomAttributeToSchema } = require('../cognito/helpers');

const TEMP_PASSWORD = '1234qwer!';

const appsync = new AWS.AppSync({
  region: 'ap-southeast-2',
});
const dynamoDB = new AWS.DynamoDB({
  region: 'ap-southeast-2',
});
const identity = new AWS.CognitoIdentityServiceProvider({
  region: 'ap-southeast-2',
});

async function getAppsyncDataSources(apiId) {
  const mapping = {};
  let nextToken;
  do {
    const ds = await appsync
      .listDataSources({
        apiId,
        maxResults: 25,
        nextToken,
      })
      .promise();
    nextToken = ds.nextToken;
    const dsList = _.get(ds, 'dataSources', []);
    await Promise.map(
      dsList,
      async source => {
        if (!source) return null;
        const dynCfg = source.dynamodbConfig;
        if (dynCfg) {
          const modelName = source.name;
          try {
            mapping[modelName] = dynCfg;
          } catch (err) {
            console.error(err.message);
          }
        }
      },
      { concurrency: 1 },
    );
  } while (nextToken);

  return mapping;
}

// async function addGroups(cognitoPoolId) {
//   const groupData = JSON.parse(
//     // eslint-disable-next-line no-undef
//     fs.readFileSync(path.join(__dirname, 'data', 'groups.json'), 'utf8'),
//   );
//   console.log('>>seed/initial::', 'groupData', groupData); //TRACE
//   await Promise.map(
//     groupData.list,
//     async grp => {
//       await identity.createGroup({ UserPoolId: cognitoPoolId, GroupName: grp }).promise();
//     },
//     { concurrency: 10 },
//   );
// }

async function main() {
  const appSyncId = 'vb63a3crvra6ni2pldzbn6iimy';
  const cognitoPoolId = 'ap-southeast-2_mrt3gSMCX';

  const dsMapping = await getAppsyncDataSources(appSyncId);
  // await addGroups(cognitoPoolId);
  // return;

  async function createDdbItem(record, { ignoreExisting } = {}) {
    const ddbTableName = _.get(dsMapping, `${record.__typename}Table.tableName`);
    console.log('>>seed/initial::', 'ddbTableName', ddbTableName); //TRACE
    if (!ddbTableName) return;
    let ddbReq = dynamoDB
      .putItem({
        ConditionExpression: 'attribute_not_exists(id)',
        TableName: ddbTableName,
        Item: AWS.DynamoDB.Converter.marshall(record),
      })
      .promise();

    if (ignoreExisting) {
      ddbReq = ddbReq.catch(err => {
        if (err.code !== 'ConditionalCheckFailedException') {
          console.log('>>seed/initial::', 'Error: ', record.__typename, record.id); //TRACE
          throw err;
        } else {
          console.log('>>seed/initial::', 'Skipping: ', record.__typename, record.id); //TRACE
        }
      });
    }

    return ddbReq;
  }

  // add member module data
  const memberData = require('./data/member.json');
  await addCustomAttributeToSchema(identity, cognitoPoolId);

  await Promise.map(
    memberData,
    async record => {
      try {
        await createDdbItem(record);
        switch (record.__typename) {
          case 'User': {
            const res = await identity
              .adminCreateUser({
                UserPoolId: cognitoPoolId,
                Username: record.email,
                DesiredDeliveryMediums: [],
                MessageAction: 'SUPPRESS',
                ForceAliasCreation: false,
                TemporaryPassword: TEMP_PASSWORD,
                UserAttributes: [
                  {
                    Name: `custom:${USER_AUTH_ATTRIB_ID}`,
                    Value: record.id,
                  },
                ],
              })
              .promise();
            await identity.adminAddUserToGroup({
              GroupName: 'admin',
              UserPoolId: cognitoPoolId,
              Username: res.User.Username,
            });
            break;
          }
          default:
        }
      } catch (err) {
        console.log(
          '>>seed/initial::',
          `Skipping: ${record.__typename}:${record.id}`,
          err.message,
        ); //TRACE
      }
    },
    { concurrency: 3 },
  );

  // add member data end

  // add setting data start

  const settingDataRaw = fs.readFileSync(
    path.join(__dirname, './data/setting.json'),
    'utf8',
  );

  const settingData = JSON.parse(settingDataRaw);

  await Promise.map(
    settingData,
    async record => {
      await createDdbItem(record, { ignoreExisting: true });
    },
    {
      concurrency: 20,
    },
  );

  // add setting data end

  // add setting data start

  const adminProjectData = require('./data/admin-project.json');

  await Promise.map(
    adminProjectData,
    async record => {
      await createDdbItem(record, { ignoreExisting: true });
    },
    {
      concurrency: 20,
    },
  );

  // add setting data end
}

main();
