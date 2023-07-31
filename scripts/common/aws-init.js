/* eslint-disable no-undef */
//polyfills
require('babel-register')({
  presets: ['env'] //install babel-preset-env
});
//polyfills end
const aws = require('aws-sdk');
const { get } = require('lodash');
const localAwsInfo = require('../../amplify/.config/local-aws-info.json');
const localEnvInfo = require('../../amplify/.config/local-env-info.json');
const currentEnv = get(localEnvInfo, 'envName');
const profile = get(localAwsInfo, [currentEnv, 'profileName']);
const awsExports = require('../../src/aws-exports').default;

if (!profile) throw new Error('No profile name found');
const credentials = new aws.SharedIniFileCredentials({ profile });
aws.config.credentials = credentials;

console.log('>>common/aws-init::', 'awsExports', awsExports); //TRACE

module.exports = {
  awsExports,
  localEnvInfo,
  localAwsInfo,
  currentEnv,
  profile
};
