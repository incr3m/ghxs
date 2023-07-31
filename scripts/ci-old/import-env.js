const { execSync } = require('child_process');

const envName = process.env.USER_BRANCH || process.env.AWS_BRANCH || process.env.ENV;

const AMPLIFY = {
  envName,
  defaultEditor: 'vscode',
};

const AWSCLOUDFORMATIONCONFIG = {
  configLevel: 'project',
  useProfile: true,
  profileName: process.env.AWS_PROFILE || 'default',
  region: process.env.AWS_REGION || 'ap-southeast-2',
};

const PROVIDERS = {
  awscloudformation: AWSCLOUDFORMATIONCONFIG,
};

/**
 *
 *  ENV NAME SHOULD EXIST IN team-provider-info.json
 *
 */
async function main() {
  console.log('>>ci/init-env::', 'hi'); //TRACE
  const cmd = `amplify init --amplify ${JSON.stringify(
    JSON.stringify(AMPLIFY),
  )} --providers ${JSON.stringify(JSON.stringify(PROVIDERS))}`;
  console.log('>>ci/init-env::', 'cmd', cmd); //TRACE
  execSync(cmd, {
    stdio: 'inherit',
  });
  execSync('cat amplify/team-provider-info.json', {
    stdio: 'inherit',
  });
  console.log('>>ci/init-env::', 'done import env'); //TRACE
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
