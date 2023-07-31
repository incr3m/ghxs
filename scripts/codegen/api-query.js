/**
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 * @typedef {import('graphql').GraphQLInputFieldMap} GraphQLInputFieldMap
 */

// dev cmd: nodemon -w scripts --exec yarn codegen
const _ = require('lodash');

const NEW_LINE = `
`;

const SCALARS = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number',
  AWSDateTime: 'string',
  AWSJSON: 'string',
  AWSURL: 'string',
};

module.exports = {
  /**
   * @param {GraphQLSchema} schema
   */
  plugin(schema) {
    const queryType = schema.getType('Query');
    if (!queryType) throw new Error('Query type not found');

    const typeImportsMapping = {};
    const modelMapping = {};
    const apiQueryMapping = {};
    const apiReturnMapping = {};

    /**
     * @type GraphQLInputFieldMap
     */
    const fields = queryType.getFields();
    for (const fieldKey in fields) {
      if (fieldKey.startsWith('get')) {
        const modelKey = fieldKey.replace('get', '');
        modelMapping[modelKey] = true;
      }
      const field = fields[fieldKey];

      apiReturnMapping[fieldKey] = field.type.name;
      const argName = `Query${_.upperFirst(fieldKey)}Args`;
      apiQueryMapping[fieldKey] = {
        key: fieldKey,
        variables: argName,
      };
      typeImportsMapping[argName] = true;
      typeImportsMapping[field.type.name] = true;
    }

    const imports = `import {
${Object.keys(typeImportsMapping)
  .filter(k => !SCALARS[k])
  .join(`,${NEW_LINE}`)}
} from 'gqlTypes';

export type TModelRecord = ${Object.keys(modelMapping).join(` | ${NEW_LINE}`)}

export type TApiQuery = 
${Object.entries(apiQueryMapping)
  .map(entry => {
    const [key, value] = entry;
    return `| {
  key: '${key}',
  variables: ${value.variables}
}`;
  })
  .join(NEW_LINE)}

export type TApiReturn = {
${Object.entries(apiReturnMapping)
  .map(entry => {
    const [key, value] = entry;
    return `${key}: ${SCALARS[value] || value}`;
  })
  .join(`,${NEW_LINE}`)}
}

`;
    return `${imports}
`;
  },
};
