const { AppSyncClient, ListDataSourcesCommand } = require('@aws-sdk/client-appsync');

const client = new AppSyncClient();

async function listAppsyncTables(apiId) {
  const tableNames = [];
  let nextToken;
  do {
    const res = await client.send(
      new ListDataSourcesCommand({
        apiId,
        maxResults: 25,
        nextToken,
      }),
    );

    nextToken = res.nextToken;
    res.dataSources.map(ds => {
      if (ds.dynamodbConfig) tableNames.push(ds.dynamodbConfig.tableName);
    });
  } while (nextToken);

  return tableNames;
}

module.exports = {
  listAppsyncTables,
};
