const { DynamoDBClient, ExecuteStatementCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

async function main() {
  console.log('>>partiql/index::', 'hello'); //TRACE
  const client = new DynamoDBClient({ region: 'ap-southeast-2' });
  const res = await client.send(
    new ExecuteStatementCommand({
      Statement: `
        select id,createdAt from "Sprint-4z2bbl35sjexfmjimqumrkjzey-dev" 
	        where sprintProjectId = ?
        `,
      Parameters: [{ S: 'f3f90050-8b6d-4576-8716-e2362282fce0' }],
    }),
  );

  console.log('>>partiql/index::', 'res', res); //TRACE
  for (const item of res.Items) {
    const record = unmarshall(item);
    console.log('>>partiql/sample-partiql-script::', 'item', record); //TRACE
    await client.send(
      new ExecuteStatementCommand({
        Statement: `
          update "Sprint-4z2bbl35sjexfmjimqumrkjzey-dev" 
            remove sortOrder
            where id = ?
          `,
        Parameters: [{ S: record.id }],
      }),
    );
  }
}

main();
