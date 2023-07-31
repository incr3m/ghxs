// const AWS = require('aws-sdk');
// const Promise = require('bluebird');
// const generateDemo = require('../demo/generate-data');
// const amplifyMeta = require('./test-meta.json');
const { execSync } = require('child_process');
const generateData = require('../data/generate-data');
const config = require('./config-env');

console.log('PROCESS_ENV ', JSON.stringify(config, null, 4));
const [demoFlag] = process.argv.slice(2);

async function main() {
  let isDemo = false;
  if (config && config.userBranch) isDemo = config.userBranch.startsWith('pr');
  //check if preview/demo branch
  if (demoFlag || isDemo) {
    execSync('yarn install', { stdio: 'inherit' });
    const amplifyMeta = require('../../amplify/backend/amplify-meta.json');
    console.log('>>ci/process-env::', 'amplifyMeta', amplifyMeta); //TRACE
    const { api, storage, auth } = amplifyMeta;
    let appSyncId, s3BucketName, cognitoPoolId;
    Object.values(api).forEach(apiRsc => {
      if (apiRsc.service === 'AppSync') appSyncId = apiRsc.output.GraphQLAPIIdOutput;
    });
    Object.values(storage).forEach(storageRsc => {
      if (storageRsc.service === 'S3') s3BucketName = storageRsc.output.BucketName;
    });
    Object.values(auth).forEach(authRsc => {
      if (authRsc.service === 'Cognito') cognitoPoolId = authRsc.output.UserPoolId;
    });
    if (!appSyncId) throw new Error('AppSync ID not found!');
    if (!s3BucketName) throw new Error('Storage Bucket Name not found!');
    if (!cognitoPoolId) throw new Error('Cognito Pool ID not found!');

    const migrateConfig = {
      COGNITO: ['ap-southeast-2_A1XVGy9Q2', cognitoPoolId], // ID POOL IDS
      APPSYNC: ['6e4uobuybjfyran2n6tdq5mlf4', appSyncId], //APPSYNC IDS
      S3: ['embrace-s3-dev61051-master', s3BucketName],
    };
    console.log('>>ci/process-env::', 'appSyncId', migrateConfig); //TRACE
    await generateData(migrateConfig);
  }

  if (config.branch === 'dev') {
    // only dev skips frontend builds, create temp build filee
    execSync('mkdir build', { stdio: 'inherit' });
    execSync('echo "success" > build/tmp.txt', { stdio: 'inherit' });
  } else if (!demoFlag) {
    execSync('yarn install', { stdio: 'inherit' });
    execSync('yarn build', { stdio: 'inherit' });
  }
}

main()
  .then(() => {
    console.log('DONE PROCESS ENV..');
    process.exit(0);
  })
  .catch(err => {
    console.log('ERROR: ', err);
    process.exit(1);
  });
