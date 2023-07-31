/* eslint-disable no-undef */
const { awsExports } = require('../common/aws-init');
const appConfig = require('../../src/config');
const { introspectionFromSchema } = require('graphql');
const { HttpLink } = require('apollo-link-http');
const { introspectSchema } = require('graphql-tools');
const { setContext } = require('apollo-link-context');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const IS_MOCK_MODE =
  awsExports.aws_appsync_dangerously_connect_to_http_endpoint_for_testing;

async function genSchema() {
  const http = new HttpLink({ uri: awsExports.aws_appsync_graphqlEndpoint, fetch });

  const link = setContext(() => ({
    headers: {
      ...(IS_MOCK_MODE && { Authorization: appConfig.FAKE_TOKEN }),
      ...(!IS_MOCK_MODE && { 'x-api-key': awsExports.aws_appsync_apiKey })
    }
  })).concat(http);

  const schema = await introspectSchema(link);
  const schemaJson = { data: introspectionFromSchema(schema) };

  fs.writeFileSync(
    path.join(__dirname, '..', '..', 'src/graphql/schema.json'),
    JSON.stringify(schemaJson, null, 1)
  );

  // const schema = await client.request(`
  //      {
  //        ${projectChunk.reduce((acc, curr, ii) => {
  //          return `
  //          ${acc}
  //          g_${ii}: get${modelName}(id: "${curr.id}"){
  //            id
  //          }
  //          `;
  //        }, '')}
  //      }
  //     `);
}

genSchema();
