import AWS from 'aws-sdk';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';

const ddb = new AWS.DynamoDB({ region: 'ap-southeast-2' });

// this only accepts es hits results
const data = JSON.parse(fs.readFileSync('scripts/dynamodb/data/delete-items.json'));

await Promise.map(_.chunk(data, 25), async chunk => {
  const requestItems = {};

  for (const item of chunk) {
    if (!item._index) continue;
    const tableName = _.capitalize(item._index);
    requestItems[tableName] = requestItems[tableName] || [];
    requestItems[tableName].push({
      DeleteRequest: {
        Key: {
          id: {
            S: item._source.id,
          },
        },
      },
    });
  }

  await ddb
    .batchWriteItem({
      RequestItems: requestItems,
    })
    .promise();
});
