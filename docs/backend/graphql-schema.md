# GraphQL Schema

## Creating / Updating model schema

> [Model](https://docs.amplify.aws/cli-legacy/graphql-transformer/model/) is a backend entity(same as tables) that stores data to DynamoDB

1. Go to schema directory`cdk-backend/lib/appsync/sample-appsync/schemas/`
2. Choose the `.graphql`module on which the new model should belong. E.g. `Project.graphql`
3. Add the new model definition or update model fields inside the file. See [here](https://docs.amplify.aws/cli-legacy/graphql-transformer/model/#model) for guidelines on definition model types

> For proper modeling of data, new models should be discussed by backend team to ensure it follows the right [designing principles](https://docs.amplify.aws/cli-legacy/graphql-transformer/dataaccess/)

1. Push your changes into your task branch
2. Create a pull request and have your changes reviewed.
3. Once approved, deploy your commit to dev instance.

   ![image](https://user-images.githubusercontent.com/3125784/179429056-cfe9180c-5c0e-48f3-8d6e-ac60efd1b34d.png)

   > Look up this loom for [Embrace admin guide](https://www.loom.com/share/97280d184d0e41dabdd64acc87aace73)

4. Run `yarn pull-schema` and `yarn codegen` on your local machine to sync schema files. Make sure the new field has been added to `public/schema.json`.

   ![image](https://user-images.githubusercontent.com/3125784/179429069-1fdbc48c-ecb7-4c39-a7e7-c97fe66154af.png)

---

## Custom Schema Attributes

**Custom schema attributes** are non-first class graphql fields which can be dynamically added to models without having to deploy changes to cloud. These fields are saved under `attributes`

### Updating custom schema attributes

1. Navigate to `src/common/graphql-api/schema/<module-name>.ts`.
2. Select a [model schema](https://zod.dev/?id=objects) and create/update fields as needed.
3. Make sure to append `.describe('[attribute]: <description>')` to the zod field.
   ```tsx
   export const TimesheetSchema = z.object({
   ...
   // attribute fields
   unlockedPeriods: TimesheetUnlockPeriodSchema.array()
      .optional()
      .nullable()
      .describe('[attribute]: unlocked periods'),
   ...
   });
   ```
4. Use [zodTransform](https://github.com/moreton-blue-software/embrace-v2/blob/master/src/common/graphql-api/transformer/base.ts#L5) and [zodParse](https://github.com/moreton-blue-software/embrace-v2/blob/master/src/common/graphql-api/transformer/base.ts#L25) for conversion. Look for examples [here](https://github.com/moreton-blue-software/embrace-v2/blob/master/src/common/graphql-api/transformer/base.test.ts)
