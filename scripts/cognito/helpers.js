const USER_AUTH_ATTRIB_ID = 'id'; //NOTE: THIS SHOULD MATCH THE VALUE ON amplify/backend/function/embraceCognitoUserCreate/src/index.js

async function addCustomAttributeToSchema(identity, poolId) {
  console.log('>>src/index::', `Adding ${USER_AUTH_ATTRIB_ID} attrib to schema...`); //TRACE
  try {
    await identity
      .addCustomAttributes({
        UserPoolId: poolId,
        CustomAttributes: [
          {
            AttributeDataType: 'String',
            Mutable: false,
            Name: USER_AUTH_ATTRIB_ID,
            Required: false,
            StringAttributeConstraints: {
              MaxLength: '50',
              MinLength: '0',
            },
          },
        ],
      })
      .promise();
  } catch (err) {
    if (!err.message.includes('Existing attribute')) throw err;
    console.log('Attribute already exist. Skipping..');
  }
}

// eslint-disable-next-line no-undef
module.exports = {
  USER_AUTH_ATTRIB_ID,
  addCustomAttributeToSchema,
};
