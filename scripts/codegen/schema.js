const embSchema = require('../../apps/main/public/schema.json');

// console.log('>>codegen/schema::', 'mySchema', embSchema); //TRACE
// for (const type of embSchema.data.__schema.types) {
//   if (type.fields && type.fields[0] && type.fields[0].name === 'id') {
//     for (const field of type.fields) {
//       console.log('>>codegen/schema::', 'type', type.name, field.name); //TRACE
//     }
//   }
// }

// eslint-disable-next-line no-undef
module.exports = embSchema;
