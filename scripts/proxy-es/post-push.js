const { createEsIndeces } = require('./lib/searchable');
const genResolver = require('./gen-resolvers');

async function main() {
  const { indeces } = await genResolver();
  if (indeces.length > 0) {
    await createEsIndeces(
      indeces.map(index => ({
        action: 'CREATE',
        index,
      })),
    );
  }
}
main();
