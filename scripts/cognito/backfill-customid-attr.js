const aws = require('aws-sdk');
const Promise = require('bluebird');

const identity = new aws.CognitoIdentityServiceProvider();
let poolId = 'ap-southeast-2_oo5qyRy9V';

async function main() {
  let PaginationToken;
  do {
    const res = await identity
      .listUsers({
        UserPoolId: poolId,
        AttributesToGet: [],
        Limit: 5,
        PaginationToken,
      })
      .promise();
    await Promise.map(res.Users, async usr => {
      console.log('>>cognito/backfill-customid-attr::', 'usr', usr); //TRACE
      await identity
        .adminUpdateUserAttributes({
          UserAttributes: [
            {
              Name: 'custom:id',
              Value: usr.Username,
            },
          ],
          UserPoolId: poolId,
          Username: usr.Username,
        })
        .promise();
    });
    PaginationToken = res.PaginationToken;
  } while (PaginationToken);
}

main();

// AWS_REGION=ap-southeast-2 AWS_PROFILE=mb-jim nodemon scripts/cognito/backfill-customid-attr.js
