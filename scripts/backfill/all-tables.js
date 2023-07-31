const AWS = require('aws-sdk');
const Promise = require('bluebird');

const { backFillTable } = require('./backfill-functions');

const apiId = 'uw4dz6pqfveania37urjrt3sj4';
const env = 'dev';

const filterTable = null;
// const filterTable = ['InvoiceDocument'];

(async () => {
  const appsync = new AWS.AppSync({
    region: 'ap-southeast-2',
  });

  // await backFillTable({
  //   tableName: `Sprint-${apiId}-${env}`,
  // });

  // return;
  try {
    let nextToken;
    do {
      const data = await appsync
        .listResolvers({
          apiId,
          nextToken,
          typeName: 'Query',
          maxResults: 25,
        })
        .promise();
      nextToken = data.nextToken;
      for (const ds of data.resolvers) {
        if (!ds.fieldName.startsWith('search')) continue;
        const modelName = ds.fieldName.replace('search', '').slice(0, -1);

        if (filterTable && !filterTable.includes(modelName)) continue;

        // console.log('>>backfill/all-tables::', ds.requestMappingTemplate, ' start'); //TRACE
        console.log('>>backfill/all-tables::', modelName, ' start'); //TRACE
        await Promise.delay(3000);
        await backFillTable({
          tableName: `${modelName}-${apiId}-${env}`,
        });
        console.log('>>backfill/all-tables::', modelName, ' done'); //TRACE
      }
    } while (nextToken);
  } catch (err) {
    console.log('err'); //TRACE
    console.log(err); //TRACE
  }
})();
