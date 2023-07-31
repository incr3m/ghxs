const Promise = require('bluebird');
const { get } = require('lodash');
const { GraphQLClient } = require('graphql-request');

const batchCount = 100;

const [modelName] = process.argv.slice(2);
let client;

const config = {
  endpoint:
    'https://4bvb3mj5ezbpfel5xhxi3ep7z4.appsync-api.ap-southeast-2.amazonaws.com/graphql',
  apiKey: 'da2-ptojoia6ufb53fqzer4hivz2yu',
};

if (process.env.NODE_ENV === 'staging') {
  config.endpoint =
    'https://g2nlykomr5bvlge5ngoomg7kda.appsync-api.ap-southeast-2.amazonaws.com/graphql';
  config.apiKey = 'da2-limicnje5zgyvicv5pkcp3cbmq';
}

(async () => {
  try {
    client = new GraphQLClient(config.endpoint, {
      headers: {
        'x-api-key': config.apiKey,
      },
    });
    let counter = 0,
      total = 0;

    // eslint-disable-next-line no-inner-declarations
    function createUpdateMutation(items) {
      return `mutation{
        ${items.map((item, ii) => {
          return `
          m_${ii}: update${modelName} (input:{
            id: "${item.id}"
          }){
            id
          }
          `;
        })}   
      }`;
    }

    // eslint-disable-next-line no-inner-declarations
    async function fetchList(nextToken) {
      const listModels = `query ($nextToken: String) {
        list: list${modelName}s (nextToken: $nextToken, limit: ${batchCount}) {
          nextToken
          items {
            id
            createdAt
          }
        }
      } 
      `;
      const variables = {
        nextToken,
      };
      const models = await client.request(listModels, variables);
      return get(models, 'list');
    }
    let nextToken;
    do {
      const data = await fetchList(nextToken);
      nextToken = data.nextToken;
      console.log('>>amplify/backfill-elasticsearch::', 'has token', !!nextToken); //TRACE
      let dataItems = get(data, 'items', []);
      total += dataItems.length;
      // filters
      dataItems = dataItems.filter(item => {
        // return item.createdAt >= '2022-12-01';
        return item;
      });
      if (dataItems.length < 1) {
        console.log('backfill/reindex::', 'items empty. skipping'); //TRACE
        break;
      }

      const mutation = createUpdateMutation(dataItems);
      const touched = await client.request(mutation);
      Object.entries(touched).forEach(entry => {
        const [mk, mo] = entry;
        if (mk && mo.id) counter++;
        else throw mo;
      });
      await Promise.delay(1500);
      console.log('>>amplify/backfill-elasticsearch::', `models:${counter}/${total}`); //TRACE
    } while (nextToken);
  } catch (err) {
    console.log('err'); //TRACE
    console.log(err); //TRACE
  }
})();
