const AWS = require('aws-sdk');
const Promise = require('bluebird');
const { Client } = require('@elastic/elasticsearch');
const { createAWSConnection, awsGetCredentials } = require('@acuris/aws-es-connection');

const config = require('../config');

async function processIndeces({ event, testMode, endpoint, elasticSearchOptions = {} }) {
  console.log('>>src/processIndeces::', 'event', event); //TRACE
  const node = endpoint;
  const esParams = { node };

  //add testMode=true to test on location
  if (!testMode && node.indexOf('localhost') === -1) {
    const awsCredentials = await awsGetCredentials();
    const AWSConnection = createAWSConnection(awsCredentials);
    esParams.Connection = AWSConnection.Connection;
  } else {
    const credentials = new AWS.SharedIniFileCredentials({ profile: 'mb-jim' });
    const AWSConnection = createAWSConnection(credentials);
    esParams.Connection = AWSConnection.Connection;
  }

  const es = new Client({
    ...esParams,
    ...elasticSearchOptions,
  });

  let errors = '';

  await Promise.map(
    event.Indeces,
    async idxData => {
      try {
        const { action, index } = idxData;
        switch (action) {
          case 'CREATE':
            await es.indices.create({
              index,
            });
            break;
          case 'DELETE':
            await es.indices.delete({
              index,
            });
            break;
          default:
            throw new Error(`action not supported ${action}`);
        }
      } catch (err) {
        if (err.message === 'resource_already_exists_exception') return;
        console.log('INDEXING ERROR');
        console.error(err);
        errors += err.message;
      }
    },
    { concurrency: 2 },
  );

  if (errors.length > 0) throw new Error(errors);
}

async function createEsIndeces(indeces) {
  // const FunctionName = process.env.ES_LAMBDA_ARN;
  // if (!FunctionName) throw new Error('Env "ES_LAMBDA_ARN" not found.');
  // const lambda = new AWS.Lambda({
  //   region: process.env.AWS_REGION || 'ap-southeast-2',
  // });
  // const params = {
  //   FunctionName,
  //   InvocationType: 'RequestResponse',
  //   // LogType: 'Tail',
  //   Payload: JSON.stringify(),
  // };
  // console.log('>>lib/searchable::', 'indeces', indeces); //TRACE
  // const res = await lambda.invoke(params).promise();
  const event = { Indeces: indeces };
  await processIndeces({
    event,
    endpoint: config.ES_ENDPOINT,
  });
}

// eslint-disable-next-line no-undef
module.exports = { createEsIndeces };
