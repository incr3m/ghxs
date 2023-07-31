const AWS = require('aws-sdk');
const { getAwsExports, getResResolverVtl, getReqResolverVtl } = require('./lib/common');
const _ = require('lodash');

const ES_PROXY_DS_FN = 'EmbraceESQuery'; //matches appsync datasource
let appsync;

async function getApiId(appEndpoint) {
  let nextToken, apiId, apiEnv, apiName;
  do {
    const res = await appsync
      .listGraphqlApis({
        nextToken,
      })
      .promise();
    nextToken = res.nextToken;
    for (const gApi of res.graphqlApis) {
      if (gApi.uris.GRAPHQL === appEndpoint) {
        apiId = gApi.apiId;
        apiName = gApi.name;
        apiEnv = _.last(apiName.split('-'));
      }
    }
    if (apiId) break;
  } while (nextToken);

  return { apiId, apiName, apiEnv };
}

async function getSearchables({ apiId, apiEnv }) {
  console.log('>>proxy-es/gen-resolvers::', '..fetching types'); //TRACE
  const params = {
    apiId,
    format: 'JSON',
    typeName: 'Query',
  };
  const res = await appsync.getType(params).promise();
  const def = JSON.parse(res.type.definition);
  const types = {};
  def.fields.forEach(field => {
    if (!field.name.startsWith('search')) return;
    const model = field.name.replace('search', '').slice(0, -1);
    const index = `${model}-${apiId}-${apiEnv}`;
    types[field.name] = {
      model,
      index: index.toLowerCase(),
    };
  });
  console.log('>>proxy-es/gen-resolvers::', '..fetching types done.'); //TRACE
  console.log('>>proxy-es/gen-resolvers::', 'types', types); //TRACE
  return types;
}

async function getProxyEsFnId(apiId) {
  let nextToken;
  do {
    const res = await appsync
      .listFunctions({
        apiId,
        nextToken,
      })
      .promise();
    for (const fn of res.functions)
      if (fn.dataSourceName.startsWith(ES_PROXY_DS_FN)) return fn.functionId;

    nextToken = res.nextToken;
  } while (nextToken);
}

async function updateSearchableResolver(apiId, { searchable, data, functionId }) {
  let op;
  const params = {
    apiId,
    fieldName: searchable,
    typeName: 'Query',
  };
  try {
    await appsync.getResolver(params).promise();
    // update
    op = 'updateResolver';
  } catch (err) {
    console.log('>>proxy-es/gen-resolvers::', 'params', params); //TRACE
    console.log('>>proxy-es/gen-resolvers::', '', err.message); //TRACE
    if (err.message !== 'No resolver found.') throw err;
    // create
    op = 'createResolver';
  }

  //   const requestMappingTemplate = `
  // ## [Start] Stash resolver specific context.. **
  // $util.qr($ctx.stash.put("typeName", "${params.typeName}"))
  // $util.qr($ctx.stash.put("fieldName", "${params.fieldName}@@${data.index}"))
  // {}
  // ## [End] Stash resolver specific context.. **
  // `;

  let requestMappingTemplate = getReqResolverVtl(params.typeName, params.fieldName);
  requestMappingTemplate = _.replace(
    requestMappingTemplate,
    /"\$indexPath"/g,
    `"/${data.index}/_doc/_search"`,
  );
  requestMappingTemplate = `
$util.qr($ctx.stash.put("typeName", "${params.typeName}"))
$util.qr($ctx.stash.put("fieldName", "${params.fieldName}"))
${requestMappingTemplate}`;

  const responseMappingTemplate = getResResolverVtl(params.typeName, params.fieldName);
  // .replace(/ctx.result/g, "ctx.prev.result")
  // .replace(/context.result/g, "context.prev.result");

  const updateParams = {
    ...params,
    requestMappingTemplate,
    kind: 'PIPELINE',
    pipelineConfig: {
      functions: [functionId],
    },
    responseMappingTemplate,
  };
  await appsync[op](updateParams).promise();

  console.log('>>proxy-es/gen-resolvers::', 'resolver updated.', params); //TRACE
}

// eslint-disable-next-line no-undef
module.exports = async function main() {
  const cfg = getAwsExports();
  const appEndpoint = cfg.aws_appsync_graphqlEndpoint;
  const appRegion = cfg.aws_appsync_region;
  console.log('>>proxy-es/gen-resolvers::', 'cfg', appEndpoint, appRegion); //TRACE
  appsync = new AWS.AppSync({
    region: appRegion,
  });

  const apiInfo = await getApiId(appEndpoint);
  const { apiId } = apiInfo;
  const types = await getSearchables(apiInfo);
  const functionId = await getProxyEsFnId(apiId);
  // const types = {
  //   searchMyTypes: { model: "MyType" },
  //   searchMyType2s: { model: "MyType2" },
  // };

  // const apiId = "m5kjcsx7czcwzmyrk3xxrsnqh4";
  // const functionId = "4dhdno2mwfekzjvuoq3vk5gyi4";

  for (const searchable in types) {
    await updateSearchableResolver(apiId, {
      searchable,
      data: types[searchable],
      functionId,
    });
  }

  const indeces = [];

  for (const key in types) {
    const type = types[key];
    indeces.push(type.index);
  }

  return { indeces };
};
