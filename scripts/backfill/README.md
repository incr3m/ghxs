## Backfill script

Iterates through all dynamodb records to trigger Opensearch sync operations. This is used when an opensearch index have been out of sync or deleted.

- Running backfill scripts on an table

```bash
AWS_PROFILE=mb-embrace node scripts/backfill/reindex <table_name>
example:
AWS_PROFILE=mb-embrace node scripts/backfill/reindex Project
```

- To modify item record fields, create another `.mjs` file to extends backfill logic:
  Sample:

```js
const { backfill } = require('./../common/back-filler');

const appId = 'sbkb2bntdfa6xclojpgj5uhqje'; // APP ID
const tableName = 'CompanyTable'; // Table Name

// update all accountManagerId to a new value
function updater() {
  return {
    ExpressionAttributeValues: {
      ':b': {
        S: 'new-account-mgr-id',
      },
    },
    UpdateExpression: 'SET accountManagerId = :b',
  };
}

await backfill(appId, tableName, updater);
console.log('done');
```
