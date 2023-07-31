import AWS from 'aws-sdk';
import { backfill } from '../common/back-filler.js';

const dynamodb = new AWS.DynamoDB();

const appId = 'mltnzrahcnaktbwscyxy2my6l4';
const tableName = 'ContactTable';
const env = 'dev';

const refDate = new Date().toISOString();

async function updater(item) {
  const tag = item?.attributes?.importPropertyName;
  console.log('backfill/lawd-contact-tags::', 'item', tag); //TRACE
  if (!tag) return false;
  await dynamodb
    .putItem({
      TableName: `ModelTag-${appId}-${env}`,
      Item: AWS.DynamoDB.Converter.marshall({
        id: `${item.id}@${tag}`,
        createdAt: refDate,
        createdBy: 'system',
        model: 'Contact',
        modelId: item.id,
        tag: tag,
        __typename: 'ModelTag',
      }),
    })
    .promise();
  return false;
}

await backfill(appId, tableName, updater, { fields: ['attributes'] });
console.log('done');
