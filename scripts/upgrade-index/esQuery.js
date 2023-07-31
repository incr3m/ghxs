const AWS = require('aws-sdk');
const { isObject } = require('lodash');

const region = process.env.REGION;
const apiCountmeinGraphQLAPIIdOutput = process.env.APP_ID;
const client = new AWS.HttpClient();

async function getEnvConfig() {
  const appsync = new AWS.AppSync({
    region
  });
  let nextToken;
  do {
    const res = await appsync
      .listDataSources({
        apiId: apiCountmeinGraphQLAPIIdOutput,
        nextToken,
        maxResults: 25
      })
      .promise();
    nextToken = res.nextToken;
    const dsList = res.dataSources || [];
    for (const ds of dsList) {
      if (ds.type === 'AMAZON_ELASTICSEARCH') {
        return {
          region: ds.elasticsearchConfig.awsRegion,
          domain: ds.elasticsearchConfig.endpoint.replace('https://', '')
        };
      }
    }
  } while (nextToken);
}

function signReq(request) {
  let credentials;
  try {
    credentials = new AWS.EnvironmentCredentials('AWS');
    const signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());
  } catch (err) {
    credentials = new AWS.SharedIniFileCredentials({ profile: 'mb-jim' });
    const signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());
  } finally {
    AWS.config.credentials = credentials;
  }
}

module.exports = async function({ index, type, id, body, method }) {
  const envConfig = await getEnvConfig();
  // console.log('>>src/index::', 'envConfig', envConfig); //TRACE
  const endpoint = new AWS.Endpoint(envConfig.domain);
  const request = new AWS.HttpRequest(endpoint, envConfig.region);

  request.method = method || 'GET';
  request.path += `${index}`;
  if (type) request.path += `/${type}`;
  if (id) request.path += `/${id}`;

  request.body = isObject(body) ? JSON.stringify(body) : body;
  request.headers['host'] = envConfig.domain;
  request.headers['Content-Type'] = 'application/json';
  request.headers['Content-Length'] = request.body.length;

  signReq(request);

  return new Promise((resolve, reject) => {
    client.handleRequest(
      request,
      null,
      function(response) {
        console.log(`${response.statusCode} ${response.statusMessage}`);
        let responseBody = '';
        response.on('data', function(chunk) {
          responseBody += chunk;
        });
        response.on('end', function() {
          // console.log(`Response body: ${responseBody}`);
          // context.done(null, ); // SUCCESS with message
          resolve(JSON.parse(responseBody));
        });
      },
      function(error) {
        console.log(`Error: ${error}`);
        // context.done(error, 'Hello World'); // SUCCESS with message
        reject(error);
      }
    );
  });
};
