const AWS = require('aws-sdk');
const { EsClient } = require('../common/es.js');

// https://aws.amazon.com/blogs/database/use-amazon-s3-to-store-a-single-amazon-elasticsearch-service-index/

const S3_BACKUP_BUCKET = 'mb-data-bak';

const ES_REGION = 'ap-southeast-2';
const ES_REPOSITORY_NAME = 'mb_data_bak_repository';

// add iam role

const iam = new AWS.IAM();

const roleName = `${S3_BACKUP_BUCKET}-es-role`;

async function ensurePermissions() {
  const getRoleRes = await iam
    .getRole({
      RoleName: roleName,
    })
    .promise();

  const savedRole = getRoleRes.Role;

  if (!savedRole) {
    const policy = await iam
      .createPolicy({
        PolicyName: `${S3_BACKUP_BUCKET}-es-policy`,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['s3:ListBucket'],
              Effect: 'Allow',
              Resource: [`arn:aws:s3:::${S3_BACKUP_BUCKET}`],
            },
            {
              Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 'iam:PassRole'],
              Effect: 'Allow',
              Resource: [`arn:aws:s3:::${S3_BACKUP_BUCKET}/*`],
            },
          ],
        }),
      })
      .promise();

    const role = await iam
      .createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: '',
              Effect: 'Allow',
              Principal: { Service: 'es.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      })
      .promise();

    await iam
      .attachRolePolicy({
        RoleName: role.Role.RoleName,
        PolicyArn: policy.Policy.Arn,
      })
      .promise();
  }

  return savedRole;
}

async function ensureSnapshotRepository(client, roleArn) {
  const checkRepoRes = await client.request({
    method: 'GET',
    path: `/_snapshot/${ES_REPOSITORY_NAME}`,
  });
  const repo = JSON.parse(checkRepoRes);
  if (repo?.[ES_REPOSITORY_NAME]) return;

  // add secondary repository snapshot backup
  const repositoryRes = await client.request({
    method: 'PUT',
    path: `/_snapshot/${ES_REPOSITORY_NAME}`,
    body: {
      type: 's3',
      settings: {
        role_arn: roleArn,
        bucket: S3_BACKUP_BUCKET,
        region: ES_REGION,
      },
    },
  });
  console.log('@scripts_backup_create_es_bak_mjs::', 'res', repositoryRes); //TRACE
}

async function createSnapshot({ name, indices, domain }) {
  const client = new EsClient({ domain, region: ES_REGION });

  const savedRole = await ensurePermissions();

  await ensureSnapshotRepository(client, savedRole.Arn);

  // -- get indices
  // const res = await client.request({
  //   method: 'GET',
  //   path: '/_cat/indices?format=json',
  //   body: {},
  // });
  // console.log('@scripts_backup_create_es_bak_mjs::', 'res', res); //TRACE

  const createSnapshotRes = await client.request({
    method: 'PUT',
    path: `/_snapshot/${ES_REPOSITORY_NAME}/${name}`,
    body: {
      indices: indices,
      ignore_unavailable: true,
      include_global_state: false,
    },
  });
  console.log('@scripts_backup_create_es_bak_mjs::', 'res', createSnapshotRes); //TRACE
  return createSnapshotRes;
}

async function restoreSnapshot({ name, indices, domain }) {
  const client = new EsClient({ domain, region: ES_REGION });

  const savedRole = await ensurePermissions();

  await ensureSnapshotRepository(client, savedRole.Arn);

  // restore snapshot
  const retoreSnapshotRes = await client.request({
    method: 'POST',
    path: `/_snapshot/${ES_REPOSITORY_NAME}/${name}/_restore`,
    body: {
      indices,
      ignore_unavailable: true,
      include_global_state: false,
    },
  });
  console.log('@scripts_backup_create_es_bak_mjs::', 'res', retoreSnapshotRes); //TRACE
  return retoreSnapshotRes;
}

async function getSnapshotStatus({ domain }) {
  const client = new EsClient({ domain, region: ES_REGION });

  const savedRole = await ensurePermissions();

  await ensureSnapshotRepository(client, savedRole.Arn);

  const snapshotStatus = await client.request({
    method: 'GET',
    path: `/_snapshot/${ES_REPOSITORY_NAME}/_status`,
  });

  const allSnapshotRes = await client.request({
    method: 'GET',
    path: `/_snapshot/${ES_REPOSITORY_NAME}/_all`,
  });

  return { status: JSON.parse(snapshotStatus), all: JSON.parse(allSnapshotRes) };
}

module.exports = { createSnapshot, restoreSnapshot, getSnapshotStatus };
