const { execSync } = require('child_process');

const envName = process.env.USER_BRANCH || process.env.AWS_BRANCH || process.env.ENV;

const AMPLIFY = {
  envName,
  appid: process.env.AWS_APP_ID,
  defaultEditor: 'vscode',
};

const AWSCLOUDFORMATIONCONFIG = {
  configLevel: 'project',
  useProfile: true,
  profileName: process.env.AWS_PROFILE || 'default',
  region: process.env.AWS_REGION || 'ap-southeast-2',
  AmplifyAppId: process.env.AWS_APP_ID,
};

const PROVIDERS = {
  awscloudformation: AWSCLOUDFORMATIONCONFIG,
};

async function main() {
  console.log('>>ci/init-env::', 'hi'); //TRACE
  execSync('envCache --set stackInfo "kakakaka"', {
    stdio: 'inherit',
  });
  execSync('envCache --get stackInfo', {
    stdio: 'inherit',
  });
  throw new Error('err');
  // const cmd = `amplify env add --amplify ${JSON.stringify(
  //   JSON.stringify(AMPLIFY),
  // )} --providers ${JSON.stringify(JSON.stringify(PROVIDERS))}`;
  // console.log('>>ci/init-env::', 'cmd', cmd); //TRACE
  // execSync(cmd, {
  //   stdio: 'inherit',
  // });
  // execSync('cat amplify/team-provider-info.json', {
  //   stdio: 'inherit',
  // });
  // console.log('>>ci/init-env::', 'done init env'); //TRACE
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
