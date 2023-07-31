const {
  DynamoDBClient,
  DescribeContinuousBackupsCommand,
  UpdateContinuousBackupsCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient();

async function pitrBackup(tableName) {
  console.log('>>backup/create-ddb-backup::', 'creating backup: ', tableName); //TRACE

  const result = await client.send(
    new DescribeContinuousBackupsCommand({
      TableName: tableName,
    }),
  );

  const pitr_status = result.ContinuousBackupsDescription.PointInTimeRecoveryDescription;
  const { PointInTimeRecoveryStatus } = pitr_status;
  console.log('PointInTimeRecoveryStatus: ', PointInTimeRecoveryStatus);

  // Check if PointInTimeRecoveryStatus is disabled it will run this function
  if (PointInTimeRecoveryStatus === 'DISABLED') {
    await client.send(
      new UpdateContinuousBackupsCommand({
        TableName: tableName,
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      }),
    );
    console.log('The table has successfully enabled Point-in-Time Recovery.');
    return;
  }

  console.log('>>backup/create-pitr-backup::', 'creating backup: ', tableName, ' done'); //TRACE
}

module.exports = {
  pitrBackup,
};
