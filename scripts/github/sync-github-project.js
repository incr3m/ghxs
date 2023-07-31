const { GraphQLClient } = require('graphql-request');
const { get, keyBy } = require('lodash');

// params
const ghToken = 'REPLACE_ME'; // dont commit
const ghProjectUrl = 'https://github.com/moreton-blue-software/embrace/projects/6';
const embEndpoint =
  'https://i7zqwwuzbrg75l4ll5xk4ctaoy.appsync-api.ap-southeast-2.amazonaws.com/graphql';
const embApiKey = 'REPLACE_ME'; // dont commit
const embProjectId = '00314893-fcdf-49e1-8f46-819ccc985b9f';

function createGhGqlClient() {
  const client = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      authorization: `bearer ${ghToken}`,
    },
  });
  return client;
}

function createEmbraceClient() {
  const ep = embEndpoint;
  return new GraphQLClient(ep, {
    headers: {
      'x-api-key': embApiKey,
    },
  });
}

let ghClient;
let embClient;
let statusKeys;

async function main() {
  ghClient = createGhGqlClient();
  embClient = createEmbraceClient();
  console.log('>>github/sync-github-project::', 'hello'); //TRACE
  const urlData = ghProjectUrl.split('/');
  const owner = urlData[3];
  const repo = urlData[4];
  console.log('>>github/sync-github-project::', 'owner,repo', owner, repo); //TRACE
  const res = await ghClient.request(/* GraphQL */ `
    {
      repository(name: "${repo}", owner: "${owner}") {
        projects(first: 20) {
          nodes {
            id
            url
          }
        }
      }
    }
  `);
  let projectNodeId;

  get(res, 'repository.projects.nodes', []).forEach(node => {
    console.log('>>github/sync-github-project::', 'node', node); //TRACE
    if (node.url === ghProjectUrl) projectNodeId = node.id;
  });
  console.log('>>github/sync-github-project::', 'projectNodeId', projectNodeId); //TRACE

  const [statusQ, ghProjectQ] = await Promise.all([
    embClient.request(/* GraphQL */ `
      {
        status: getSetting(id: "kwTaskStatusList") {
          id
          value
        }
      }
    `),
    ghClient.request(/* GraphQL */ `
      {
        node(id: "${projectNodeId}") {
          ... on Project {
            id
            columns(first: 20) {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `),
  ]);

  console.log('>>github/sync-github-project::', 'statusQ', statusQ); //TRACE
  statusKeys = keyBy(JSON.parse(statusQ.status.value).items, o => o.text.toUpperCase());
  console.log('>>github/sync-github-project::', 'ghProjectQ', ghProjectQ); //TRACE
  const projColIds = [];
  get(ghProjectQ, 'node.columns.nodes', []).forEach(col => {
    console.log('>>github/sync-github-project::', 'col', col); //TRACE
    if (statusKeys[col.name.toUpperCase()]) projColIds.push(col.id);
  });
  console.log('>>github/sync-github-project::', 'projColIds', projColIds); //TRACE
  for (const colId of projColIds) await updateCards(colId);
}

async function updateCards(colNodeId) {
  const batch = 10;
  let cursor;
  do {
    const res = await ghClient.request(
      /* GraphQL */ `
    query($cursor: String){
      node(id: "${colNodeId}") {
        ... on ProjectColumn {
          id
          name
          cards(first: ${batch}, after: $cursor ) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              content {
                ... on Issue {
                  id
                  number
                }
              }
            }
          }
        }
      }
    }
  `,
      { cursor },
    );
    console.log('>>github/sync-github-project::', 'res', res); //TRACE
    const status = get(res, 'node.name', '').toUpperCase();
    const cards = get(res, 'node.cards.nodes', []);
    cursor = get(res, 'node.cards.pageInfo.hasNextPage')
      ? get(res, 'node.cards.pageInfo.endCursor')
      : null;
    console.log('>>github/sync-github-project::', 'cards,cursor', status, cards, cursor); //TRACE
    await updateTasks(
      cards.map(c => get(c, 'content.number')),
      statusKeys[status].text,
    );
  } while (cursor);
  console.log('>>github/sync-github-project::', 'Done ', colNodeId); //TRACE
}

async function updateTasks(taskCodes, status) {
  if (!status) return;
  let res = await embClient.request(
    /* GraphQL */ `
      query($filter: SearchableTaskFilterInput) {
        searchTasks(filter: $filter) {
          items {
            id
          }
        }
      }
    `,
    {
      filter: {
        or: taskCodes.map(code => ({ code: { eq: code } })),
        projectId: { eq: embProjectId },
        // status: { ne: status },
        source: {
          matchPhrasePrefix: 'github::',
        },
      },
    },
  );
  let m = '';
  get(res, 'searchTasks.items', []).forEach((task, ii) => {
    m += `
    m_${ii}:updateTask(input:{id:"${task.id}", status: "${status}"}){id}
    `;
  });
  res = await embClient.request(`mutation { ${m} }`);
}

main();
