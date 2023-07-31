/* eslint-disable max-depth */
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const { parse: parseSchema } = require('graphql');
const { getAwsExports } = require('../common/helpers');

const REQ_GROUP_LIMIT = 20;
const GQL_API_NAME = 'embrace';

const awsExportsConfig = getAwsExports();
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'ap-southeast-2',
});

function getApiSchemaObject() {
  const gqlApiPath = path.join('.', 'amplify', 'backend', 'api', GQL_API_NAME, 'schema');
  if (!fs.existsSync(gqlApiPath)) return;
  let schemaString = '';

  fs.readdirSync(gqlApiPath).forEach(filename => {
    const ext = path.parse(filename).ext;
    if (ext === '.graphql') {
      const txt = fs.readFileSync(path.join(gqlApiPath, filename), 'utf8') || '';
      schemaString += `${txt}
`;
    }
  });
  const schema = parseSchema(schemaString);
  return schema;
}

function getSchemaPermissions(schema) {
  const permissionMapping = {};
  for (const schemaObj of schema.definitions) {
    for (const directive of schemaObj.directives) {
      if (directive.name.value === 'auth') {
        for (const argument of directive.arguments) {
          if (argument.name.value === 'rules') {
            for (const rule of argument.value.values) {
              for (const field of rule.fields) {
                if (field.name.value === 'groups') {
                  for (const permission of field.value.values)
                    permissionMapping[permission.value] = true;
                }
              }
            }
          }
        }
      }
    }
  }
  return permissionMapping;
}

async function getCognitoGroups() {
  const aws_user_pools_id = awsExportsConfig.aws_user_pools_id;
  const cognitoGroupByKey = {};
  let NextToken;
  do {
    const res = await cognito
      .listGroups({
        UserPoolId: aws_user_pools_id,
        Limit: REQ_GROUP_LIMIT,
        NextToken,
      })
      .promise();
    for (const group of res.Groups) cognitoGroupByKey[group.GroupName] = true;
    NextToken = res.NextToken;
  } while (NextToken);

  console.log(
    '>>upload-auth-permissions/index::',
    'cognitoGroupByKey',
    cognitoGroupByKey,
  ); //TRACE
  return cognitoGroupByKey;
}

async function addCognitoGroups(groups) {
  const aws_user_pools_id = awsExportsConfig.aws_user_pools_id;
  await Promise.map(
    groups,
    async group => {
      const [res] = await Promise.all([
        cognito
          .createGroup({
            GroupName: group,
            UserPoolId: aws_user_pools_id,
          })
          .promise(),
        Promise.delay(1100), // forces per second
      ]);
      console.log('>>upload-auth-permissions/index::', 'res', res); //TRACE
    },
    { concurrency: 5 },
  );
}

async function main() {
  console.log('>>upload-auth-permissions/index::', 'Uploading permissions...'); //TRACE
  const schema = getApiSchemaObject();
  if (!schema) {
    console.log('>>upload-auth-permissions/index::', 'build/schema.graphql not found'); //TRACE
    return;
  }
  const permissions = getSchemaPermissions(schema);
  // console.log('>>upload-auth-permissions/index::', 'permissions', permissions); //TRACE
  const cognitoGroups = await getCognitoGroups();
  // console.log('>>upload-auth-permissions/index::', 'schema', permissions, cognitoGroups); //TRACE
  //get new permissions
  const toAddGroups = [];
  for (const key in permissions) if (!cognitoGroups[key]) toAddGroups.push(key);
  await addCognitoGroups(toAddGroups);
  console.log('>>upload-auth-permissions/index::', 'toAddGroups', toAddGroups); //TRACE
}

main();
