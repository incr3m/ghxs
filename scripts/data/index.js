const generateData = require('./generate-data');

const migrateConfig = {
  // COGNITO: ['ap-southeast-2_A1XVGy9Qa2', 'ap-southeast-2_65THmOOt9'], // ID POOL IDS
  APPSYNC: ['6e4uobuybjfyran2n6tdq5mlfa4', 'hmbj3prbcjgqhivdtj2yaq7yi4'], //APPSYNC IDS
  // S3: ['embrace-s3-dev61051-mastear', 'mb2-embrace-s3-prod'],
  PROFILE: ['mb-jim', 'mb-jim'],
};

async function main() {
  await generateData(migrateConfig, {
    maxItemsPerTable: 100000,
  });
}

main();
