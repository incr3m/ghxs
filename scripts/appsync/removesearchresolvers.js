const AWS = require('aws-sdk');

const appsync = new AWS.AppSync({
  region: 'ap-southeast-2',
});

async function main() {
  // const {
  //   graphqlApi:api
  // } = await appsync
  //   .getGraphqlApi({
  //   })
  //   .promise();
  // console.log('>>embrace/removesearchresolvers::', 'api', api); //TRACE

  const apiId = 'zrn5udhp4begraa7dc3uily5r4';

  let nextToken;
  do {
    const list = await appsync
      .listResolvers({
        apiId,
        typeName: 'Query',
        maxResults: 20,
        nextToken,
      })
      .promise();

    nextToken = list.nextToken;
    for (const resolver of list.resolvers) {
      if (resolver.fieldName.startsWith('search')) {
        console.log('>>embrace/removesearchresolvers::', 'resolver', resolver.fieldName); //TRACE
        await appsync
          .deleteResolver({
            apiId,
            fieldName: resolver.fieldName,
            typeName: 'Query',
          })
          .promise();
      }
    }
  } while (nextToken);
}
main();
