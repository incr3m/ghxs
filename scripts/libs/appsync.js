require('cross-fetch/polyfill');
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const client = new AWSAppSyncClient({
  url: process.env.API_URL,
  region: process.env.REGION || 'ap-southeast-2',
  disableOffline: true,
  auth: {
    type: 'API_KEY',
    apiKey: process.env.API_KEY,
  },
});

const ES_GQL = gql`
  query($index: String!, $type: String!, $body: AWSJSON) {
    q: esQuery(index: $index, type: $type, body: $body)
  }
`;

function esQueryReq({ index, type = '_search', body, ...rest }) {
  return {
    query: ES_GQL,
    variables: {
      type,
      index,
      body: JSON.stringify(body),
    },
    ...rest,
  };
}

// eslint-disable-next-line no-undef
module.exports = { client, esQueryReq };
