const { awsExports } = require('../common/aws-init');
const { GraphQLClient } = require('graphql-request');
const Promise = require('bluebird');
const range = require('lodash/range');
const chunk = require('lodash/chunk');
const faker = require('faker');
const appConfig = require('../../src/config');

// const argv = process.argv;
// console.log('>>seed/all::', 'argv', argv); //TRACE

const BATCH_SIZE = 20;
const TOTAL_PROJECTS = 30;
const IS_MOCK_MODE =
  awsExports.aws_appsync_dangerously_connect_to_http_endpoint_for_testing;

// const fakeToken = console.log('>>seed/all::', 'awsExports', awsExports); //TRACE
// const client = new GraphQLClient();

const client = new GraphQLClient(awsExports.aws_appsync_graphqlEndpoint, {
  headers: {
    ...(IS_MOCK_MODE && { Authorization: appConfig.FAKE_TOKEN }),
    ...(!IS_MOCK_MODE && { 'x-api-key': awsExports.aws_appsync_apiKey })
    // Authorization: IS_MOCK_MODE ? appConfig.FAKE_TOKEN : awsExports.aws_appsync_apiKey
  }
});

function seedModels(models) {
  const projects = models;
  const modelName = 'Project';
  return Promise.map(chunk(projects, BATCH_SIZE), async function(projectChunk) {
    console.log('>>seed/all::', 'projectChunk', projectChunk); //TRACE
    const existings = await client.request(`
       {
         ${projectChunk.reduce((acc, curr, ii) => {
           return `
           ${acc}
           g_${ii}: get${modelName}(id: "${curr.id}"){
             id
           }
           `;
         }, '')}
       }
      `);
    const toDelete = Object.values(existings).filter(f => f);
    console.log('>>seed/all::', 'items to delete: ', toDelete.length); //TRACE
    if (toDelete.length) {
      await client.request(`
      mutation {
        ${Object.values(existings).reduce((acc, curr, ii) => {
          if (!curr || !curr.id) return;
          return `
          ${acc}
          d_${ii}: delete${modelName}(input:{id: "${curr.id}"}){
            id
          }
          `;
        }, '')}
      }
      `);
    }
    // CreateContactInput!
    console.log('>>seed/all::', 'recreating records: ', projectChunk.length); //TRACE
    let args = '',
      mutations = '',
      variables = {};
    projectChunk.forEach((p, ii) => {
      args += `
        $c_${ii}: Create${modelName}Input!
        `;
      mutations += `
        c_${ii}: create${modelName}(input: $c_${ii}){
          id
        }
        `;
      variables = { ...variables, [`c_${ii}`]: p };
    });
    await client.request(
      `
       mutation (
        ${args}
       ){
        ${mutations}
       }
      `,
      variables
    );
  });
}

// seed projects
const projects = range(0, TOTAL_PROJECTS).map(num => ({
  id: `xxx-project-${num}`,
  name: faker.company.catchPhrase()
}));

seedModels(projects);
