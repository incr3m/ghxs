// const AWS = require('aws-sdk');
// const Promise = require('bluebird');
// const generateDemo = require('../demo/generate-data');
// const amplifyMeta = require('./test-meta.json');
const { execSync } = require('child_process');
const config = require('./config-env');

console.log('PROCESS_ENV ', JSON.stringify(config, null, 4));

async function main() {
  const isDemo = config.userBranch.startsWith('pr');

  if (config.branch === 'review' && !isDemo) {
    // use dev aws-exports and skip backend build
    console.log('>>ci/process-env::', 'skipping backend build..');
    console.log('>>ci/process-env::', 'copying dev config..');
    execSync('cp scripts/ci/dev-aws-exports.js src/aws-exports.js', { stdio: 'inherit' });
  } else {
    // build backend
    execSync('npm i @aws-amplify/cli@4.29.1 -g', { stdio: 'inherit' });
    execSync('amplifyPush --simple', { stdio: 'inherit' });
    execSync('amplify codegen', { stdio: 'inherit' });
    execSync('yarn --cwd scripts/upload-auth-permissions install', { stdio: 'inherit' });
    execSync('node scripts/upload-auth-permissions', { stdio: 'inherit' });
  }
}

main()
  .then(() => {
    console.log('DONE SETUP ENV..');
    process.exit(0);
  })
  .catch(err => {
    console.log('ERROR: ', err);
    process.exit(1);
  });
