const _ = require('lodash');
const {
  DynamoDBClient,
  ExecuteStatementCommand,
  BatchExecuteStatementCommand,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const TABLE = 'Timesheet-4z2bbl35sjexfmjimqumrkjzey-dev';

async function main() {
  const client = new DynamoDBClient({ region: 'ap-southeast-2' });
  let nextToken;
  do {
    const res = await client.send(
      new ExecuteStatementCommand({
        Statement: `select id,status from "${TABLE}"`,
        NextToken: nextToken,
      }),
    );

    for (const items of _.chunk(res.Items, 25)) {
      const statements = items.map(item => {
        const record = unmarshall(item);
        return {
          Statement: `
          update "${TABLE}"
            set status=?
            where id = ?
          `,
          Parameters: [{ S: 'IN PROGRESS' }, { S: record.id }],
        };
      });

      if (statements.length) {
        await client.send(
          new BatchExecuteStatementCommand({
            Statements: statements,
          }),
        );
      }
    }
    nextToken = res.NextToken;
  } while (nextToken);
}

main();
