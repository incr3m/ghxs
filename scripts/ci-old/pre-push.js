// const Promise = require('bluebird');
// const generateDemo = require('../demo/generate-data');
// const amplifyMeta = require('./test-meta.json');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const amplifyDir = path.join(process.cwd(), 'amplify');

const amplifyAppId = process.env.AWS_APP_ID;
const envName = process.env.USER_BRANCH || process.env.AWS_BRANCH || process.env.ENV;

const amplify = new AWS.Amplify({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

function readJson(amplifyPath) {
  const authParamsPath = path.join(amplifyDir, amplifyPath);
  return JSON.parse(fs.readFileSync(authParamsPath, 'utf8'));
}

async function getDomainName(appId) {
  const res = await amplify
    .listDomainAssociations({
      appId,
      maxResults: 10,
    })
    .promise();

  let domainName = `${envName}.${appId}.amplifyapp.com`;

  const customDomainName = _.get(res, 'domainAssociations.0.domainName');
  if (customDomainName) {
    const subDomains = _.get(res, 'domainAssociations.0.subDomains', []);
    for (const { subDomainSetting: subDomain } of subDomains) {
      if (subDomain.branchName === envName) {
        domainName = customDomainName;
        if (subDomain.prefix) domainName = `${subDomain.prefix}.${customDomainName}`;
        break;
      }
    }
  }

  // specific config for dev / review embrace branches
  if (domainName === 'dev.d29dyd1nwlp91l.amplifyapp.com')
    domainName = `review.${customDomainName}`;

  return domainName;
}

async function main() {
  if (!envName) throw new Error('No env defined');

  let appId = amplifyAppId;
  if (!appId) {
    const teamProviderJson = readJson('team-provider-info.json');
    const envData = teamProviderJson[envName];
    appId = _.get(envData, 'awscloudformation.AmplifyAppId');
  }

  const domainName = await getDomainName(appId);

  console.log('>>ci/pre-push::', 'domainName', domainName); //TRACE

  // update cognito parameters start
  const authParamsPath = path.join(
    amplifyDir,
    'backend/auth/embrace2eba999a/parameters.json',
  );
  const authParams = JSON.parse(fs.readFileSync(authParamsPath, 'utf8'));

  _.set(authParams, 'domainName', domainName);
  fs.writeFileSync(authParamsPath, JSON.stringify(authParams, null, 2), {
    encoding: 'utf8',
  });

  console.log('PREPUSH: Done updating cognito parameter.json');
  // update cognito parameters end
}

main()
  .then(() => {
    console.log('DONE PREPUSH..');
    process.exit(0);
  })
  .catch(err => {
    console.log('ERROR: ', err);
    process.exit(1);
  });
