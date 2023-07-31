const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const data = require('./data/setting.json');

// this file convers dynamodb json data format to standard json

for (const item of data) {
  item.value = AWS.DynamoDB.Converter.unmarshall(item.value);
  console.log('>>seed/pp::', 'd', item); //TRACE
}

fs.writeFileSync(
  path.join(__dirname, './data/setting-tmp.json'),
  JSON.stringify(data, null, 2),
  {
    encoding: 'utf8',
  },
);
