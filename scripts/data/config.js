const faker = require('faker');

// eslint-disable-next-line no-undef
module.exports = {
  // source data resources
  source: {
    cognito: 'ap-southeast-2_A1XVGy9Q2',
    appSync: '6e4uobuybjfyran2n6tdq5mlf4',
    s3: 'embrace-s3-dev61051-master',
  },
  cognitoTempPassword: '1234qwer',
  // max record seed limit for each table
  recordLimit: 500,
  // manipulate each record copied from source
  recordMapping: {
    User: record => {
      return Object.assign({}, record, { firstName: faker.name.firstName() });
    },
    Project: record => {
      return Object.assign({}, record, {
        name: faker.company.companyName(),
        description: faker.lorem.sentence(),
      });
    },
  },
  // modify schema definitions
  modelDefinition: {
    Task: {
      fields: {
        // custom fields
      },
    },
  },
};
