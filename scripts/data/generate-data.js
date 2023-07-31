require('../common/polyfills');
const aws = require('aws-sdk');
const Promise = require('bluebird');
const { get, omit, keyBy } = require('lodash');
const config = require('../../src/aws-exports').default;
const generateConfig = require('./config');
const { addCustomAttributeToSchema } = require('../cognito/helpers');

// const migrateConfig = {
// COGNITO: ['ap-southeast-2_hKFBF4dC0', 'ap-southeast-2_fSQxF6ASk'], // ID POOL IDS
// APPSYNC: ['4uwanpq2azbgfaykydjxn6vaaq', 'quju4rtvtrh4fcwi2bexhprpqm'] //APPSYNC IDS
// S3: ['embrace-s3-dev73453-dev', 'embrace-s3-dev55745-prbaea'],
// };

const ORG_ID = 'o-ki201eg1dd';
const THROTTLE = 1000; //ms
const TEMP_PASSWORD = generateConfig.cognitoTempPassword || '1234qwer';

let profile,
  options = {};

function getCognitoUserAttr(cognitoUser, attrName) {
  const { Attributes = [] } = cognitoUser;
  for (const attr of Attributes) if (attr.Name === attrName) return attr.Value;
}

async function cognitoCloner(from, to) {
  const sourceIdentity = new aws.CognitoIdentityServiceProvider({
    region: config.aws_cognito_region,
    credentials: profile ? profile.source : undefined,
  });
  const targetIdentity = new aws.CognitoIdentityServiceProvider({
    region: config.aws_cognito_region,
    credentials: profile ? profile.target : undefined,
  });

  let shouldCreateUsers = true;
  const users = await targetIdentity
    .listUsers({
      UserPoolId: to,
    })
    .promise();

  if (get(users, 'Users.length') > 0) {
    console.error(`
--------------
----- Skipping COGNITO because target is not empty
--------------
`);
    shouldCreateUsers = false;
  }

  await addCustomAttributeToSchema(targetIdentity, to);

  async function createUsers() {
    const params = { UserPoolId: from, Limit: 5 };
    let token = undefined;
    do {
      const data = await sourceIdentity
        .listUsers({ ...params, PaginationToken: token })
        .promise();
      token = data.PaginationToken;
      console.log('>>migration/clone::', 'data.Users', data.Users.length); //TRACE
      //delay of 1 second per loop;
      await Promise.all([
        Promise.map(
          data.Users,
          async user => {
            let userEmail;
            const attributes = user.Attributes.filter(a => {
              if (a.Name === 'email') userEmail = a.Value;
              return a.Name !== 'sub';
            });
            await targetIdentity
              .adminCreateUser({
                UserPoolId: to,
                Username: userEmail,
                DesiredDeliveryMediums: [],
                MessageAction: 'SUPPRESS',
                ForceAliasCreation: false,
                TemporaryPassword: TEMP_PASSWORD,
                UserAttributes: attributes,
              })
              .promise();
          },
          { concurrency: 5 },
        ),
        Promise.delay(THROTTLE),
      ]);
    } while (token);
  }
  async function createGroups() {
    const groups = await sourceIdentity
      .listGroups({
        UserPoolId: from,
      })
      .promise();
    await Promise.map(get(groups, 'Groups', []), async group => {
      try {
        await targetIdentity
          .createGroup({
            ...omit(group, ['LastModifiedDate', 'CreationDate']),
            UserPoolId: to,
          })
          .promise();
      } catch (_) {
        //ignore
        console.error(`Group name already exists. ${group.GroupName}`);
      }
      const GroupName = group.GroupName;
      console.info(`Adding users to group: ${GroupName}`);
      let NextToken;
      do {
        const res = await sourceIdentity
          .listUsersInGroup({
            GroupName,
            UserPoolId: from,
            NextToken,
            Limit: 5,
          })
          .promise();
        NextToken = res.NextToken;
        await Promise.all([
          Promise.map(
            get(res, 'Users', []),
            async user => {
              // console.log('>>demo/generate-data::', 'user', user); //TRACE
              await targetIdentity
                .adminAddUserToGroup({
                  GroupName,
                  UserPoolId: to,
                  Username: getCognitoUserAttr(user, 'email'),
                })
                .promise();
            },
            { concurrency: 5 },
          ),
          Promise.delay(THROTTLE),
        ]);
      } while (!!NextToken === true);
      console.info('Users added to group');
    });
  }
  if (shouldCreateUsers) await createUsers();

  await createGroups();
}

async function dynamodbCloner(from, to) {
  const sourceAppsync = new aws.AppSync({
    region: config.aws_cognito_region,
    credentials: profile ? profile.source : undefined,
  });
  const targetAppsync = new aws.AppSync({
    region: config.aws_cognito_region,
    credentials: profile ? profile.target : undefined,
  });
  const sourceDynamoDB = new aws.DynamoDB({
    region: config.aws_cognito_region,
    credentials: profile ? profile.source : undefined,
  });
  const targetDynamoDB = new aws.DynamoDB({
    region: config.aws_cognito_region,
    credentials: profile ? profile.target : undefined,
  });

  async function restoreTable(modelName, fromTable, toTable) {
    const check = await targetDynamoDB.scan({ TableName: toTable }).promise();
    if (get(check, 'Items.length') > 0) {
      console.error(`
--------------
----- Skipping APPSYNC-TABLE ${modelName} because destination is not empty
--------------
`);
      return;
    }

    let nextToken,
      writeTotal = 0;
    do {
      const data = await sourceDynamoDB
        .scan({
          TableName: fromTable,
          ExclusiveStartKey: nextToken,
          Limit: 25,
        })
        .promise();
      const items = get(data, 'Items', []);
      if (items.length > 0) {
        console.log(
          `Writing to table ${modelName} : item count ${items.length},${writeTotal}`,
        );
        await Promise.all([
          targetDynamoDB
            .batchWriteItem({
              RequestItems: {
                [toTable]: items.map(item => ({ PutRequest: { Item: item } })),
              },
            })
            .promise(),
          Promise.delay(200),
        ]);
      }
      nextToken = get(data, 'LastEvaluatedKey');
      writeTotal += items.length;
      if (options.maxItemsPerTable && writeTotal >= options.maxItemsPerTable) break;
    } while (nextToken);
  }

  let nextToken;
  do {
    const ds = await sourceAppsync
      .listDataSources({
        apiId: from,
        maxResults: 25,
        nextToken,
      })
      .promise();
    nextToken = ds.nextToken;
    const dsList = get(ds, 'dataSources', []);
    await Promise.map(
      dsList,
      async source => {
        if (!source) return null;
        const dynCfg = source.dynamodbConfig;
        if (dynCfg) {
          const modelName = source.name;
          try {
            const toDs = await targetAppsync
              .getDataSource({ apiId: to, name: modelName })
              .promise();
            await restoreTable(
              modelName,
              dynCfg.tableName,
              get(toDs, 'dataSource.dynamodbConfig.tableName'),
            );
          } catch (err) {
            console.error(err.message);
          }
        }
      },
      { concurrency: 1 },
    );
  } while (nextToken);
}

async function s3Cloner(from, to) {
  console.info(`--- Syncing bucket ${from} to ${to}`);

  const sourceS3 = new aws.S3({
    region: config.aws_cognito_region,
    credentials: profile ? profile.source : undefined,
  });

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowOrgAccessGet',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${from}/*`],
        Condition: { StringEquals: { 'aws:PrincipalOrgID': [ORG_ID] } },
      },
      {
        Sid: 'AllowOrgAccessList',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:ListBucket'],
        Resource: [`arn:aws:s3:::${from}`],
        Condition: { StringEquals: { 'aws:PrincipalOrgID': [ORG_ID] } },
      },
    ],
  };
  let currentPolicy;

  await sourceS3
    .getBucketPolicy({
      Bucket: from,
    })
    .promise()
    .then(s3policy => {
      currentPolicy = JSON.parse(s3policy.Policy);
    })
    .catch(err => {
      if (err.code !== 'NoSuchBucketPolicy') throw err;
    });

  if (currentPolicy) {
    const newStmt = keyBy(currentPolicy.Statement, 'Sid');
    get(policy, 'Statement').forEach(s => {
      newStmt[s.Sid] = s;
    });
    currentPolicy.Statement = Object.values(newStmt);
  } else {
    currentPolicy = policy;
  }

  await sourceS3
    .putBucketPolicy({
      Policy: JSON.stringify(currentPolicy),
      Bucket: from,
    })
    .promise();
  // wait 5 seconds
  console.log('>>data/generate-data::', 'waiting bucket policy to be applied.'); //TRACE
  await Promise.delay(5000);
  console.log('>>data/generate-data::', 'syncing bucket..'); //TRACE

  require('child_process').execSync(`aws s3 sync s3://${from} s3://${to}`, {
    stdio: 'inherit',
    ...(profile && { env: { AWS_PROFILE: profile.target.profile } }),
    // env: {
    //   AWS_PROFILE: profile,
    // },
  });
}

// eslint-disable-next-line no-undef
module.exports = async function main(migrateConfig, seedOptions) {
  const { COGNITO, APPSYNC, S3, PROFILE } = migrateConfig;
  if (PROFILE) {
    profile = {
      source: new aws.SharedIniFileCredentials({ profile: PROFILE[0] }),
      target: new aws.SharedIniFileCredentials({ profile: PROFILE[1] }),
    };
  }
  options = seedOptions || {};
  if (COGNITO) await cognitoCloner(...COGNITO);
  if (APPSYNC) await dynamodbCloner(...APPSYNC);
  if (S3) await s3Cloner(...S3);
  console.log('DEMO SEED DONE!.');
};
