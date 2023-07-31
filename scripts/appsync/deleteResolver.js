/* eslint-disable no-undef */
const { awsExports } = require('../common/aws-init');
// const appConfig = require('../../src/config');
const aws = require('aws-sdk');
const { get } = require('lodash');

(async function() {
  const appsync = new aws.AppSync({
    region: awsExports.aws_cognito_region
  });

  const apis = await appsync
    .listGraphqlApis({
      maxResults: 25
    })
    .promise();
  let api;
  apis.graphqlApis.some(apiRec => {
    const ep = get(apiRec, 'uris.GRAPHQL');
    if (ep === awsExports.aws_appsync_graphqlEndpoint) {
      api = apiRec;
      return true;
    }
  });
  if (!api) throw new Error('not found');
  const { apiId } = api;
  console.log('>>appsync/deleteResolver::', 'api', apiId); //TRACE
  // const res = await appsync.listTypes({ apiId, format: 'JSON' }).promise();
  const res = await appsync
    .listResolvers({
      apiId,
      typeName: 'TaskAssignment'
    })
    .promise();
  console.log('>>appsync/deleteResolver::', 'res', res); //TRACE
})();
