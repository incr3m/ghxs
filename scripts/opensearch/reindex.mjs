import fs from 'fs';
import * as url from 'url';
import path from 'path';
import { Client } from '@opensearch-project/opensearch';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import createAwsOpensearchConnector from 'aws-opensearch-connector';

// import validator from './reindex-validator.js';

const openSearchHost =
  'https://search-dev-mb-os-domain-gszapqmdqz3uhpa4gueocs3754.ap-southeast-2.es.amazonaws.com/';

const [endsWith] = process.argv.slice(2);
// const endsWith = '-zrcsbird2rcynnog776kyxflmq-demo';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const indexMappingConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, './reindex.config.json')),
);

const getClient = async () => {
  const awsCredentials = await defaultProvider()();
  const connector = createAwsOpensearchConnector({
    credentials: awsCredentials,
    region: process.env.AWS_REGION ?? 'ap-southeast-2',
    getCredentials: function (cb) {
      return cb();
    },
  });
  return new Client({
    ...connector,
    node: openSearchHost,
  });
};

const client = await getClient();

const indeces = await client.cat
  .indices({ format: 'json' })
  .then(res => {
    return res.body.map(index => index.index);
  })
  .then(indeces => {
    return indeces.filter(index => index.endsWith(endsWith));
  });

for (const index of indeces) {
  if (index.startsWith('tmp-')) continue;

  const shouldReindex = true;
  // const shouldReindex = await validator(client, index);

  if (!shouldReindex) {
    console.log('Skipping reindex for: ', index);
    continue;
  }

  const tempIndex = `tmp-${index}`;

  await client.indices
    .get({ index: tempIndex })
    .then(async () => {
      console.log(`Removing existing temp index ${tempIndex}`);
      await client.indices.delete({ index: tempIndex }).catch();
    })
    .catch(() => {});

  const [indexExactName] = index.split('-');
  const indexMapping = indexMappingConfig[indexExactName];
  console.log('Getting index mapping config: ', indexMapping);

  console.log(`Creating temp index ${tempIndex}`);
  await client.indices.create({
    index: tempIndex,
    body: indexMapping ? indexMapping : undefined,
  });

  console.log(`Reindexing ${index} to ${tempIndex}`);
  await client.reindex({
    body: {
      source: {
        index,
      },
      dest: {
        index: tempIndex,
      },
    },
  });

  console.log(`Deleting index ${index}`);
  await client.indices.delete({
    index,
  });

  const tempMappings = await client.indices
    .getMapping({
      index: tempIndex,
    })
    .then(res => {
      return res.body[tempIndex].mappings;
    });

  console.log(`Recreating index ${index} with new mapping`);
  await client.indices.create({
    index,
    body: {
      mappings: tempMappings,
    },
  });

  console.log(`Reindexing ${tempIndex} to ${index}`);
  await client.reindex({
    body: {
      source: {
        index: tempIndex,
      },
      dest: {
        index,
      },
    },
  });

  console.log(`Deleting temp index ${tempIndex}`);
  await client.indices.delete({
    index: tempIndex,
  });
}
