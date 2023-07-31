const {
  DynamoDBClient,
  CreateBackupCommand,
  ListBackupsCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient();

async function createBackup(tableName, date) {
  console.log('>>backup/create-ddb-backup::', 'creating backup: ', tableName); //TRACE

  const ts = date.toLocaleDateString('en-se').replace(/-/g, '');

  const res = await client.send(
    new ListBackupsCommand({
      TableName: tableName,
      TimeRangeLowerBound: date,
      Limit: 99,
    }),
  );

  const bakName = `${tableName}-${ts}`;

  const exists = res.BackupSummaries.some(bak => {
    return bak.BackupName === bakName;
  });

  if (exists) {
    console.log('>>backup/create-ddb-backup::', 'backup exists: ', bakName); //TRACE
    return;
  }

  await client.send(
    new CreateBackupCommand({
      BackupName: bakName,
      TableName: tableName,
    }),
  );
  console.log('>>backup/create-ddb-backup::', 'creating backup: ', tableName, ' done'); //TRACE
}

module.exports = {
  createBackup,
};
