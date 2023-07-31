import AWS from 'aws-sdk';

const ddb = new AWS.DynamoDB({ region: 'ap-southeast-2' });

let lastEvaluatedKey = null;
do {
  const params = {
    TableName: 'Project-4z2bbl35sjexfmjimqumrkjzey-dev',
    FilterExpression: '#key1.#key2 = :queryValue',
    Limit: 100,
    ExclusiveStartKey: lastEvaluatedKey,
    ExpressionAttributeNames: {
      '#key1': 'attributes',
      '#key2': 'isAsIsComplete',
    },
    ExpressionAttributeValues: {
      ':queryValue': { S: 'no' },
    },
  };

  const res = await ddb.scan(params).promise();
  lastEvaluatedKey = res.LastEvaluatedKey;
  console.log('dynamodb/filter-nested-fields::', res.Items.length); //TRACE

  res.Items.forEach(item => {
    console.log('dynamodb/filter-nested-fields::', 'item.id', item.id); //TRACE
  });
} while (lastEvaluatedKey !== undefined);
