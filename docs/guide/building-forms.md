## Building Forms

### Tools:

- [React hook form](https://react-hook-form.com/) - Form builder
- [Zod](https://zod.dev/) - Types and Schema validation

### **Part 1**: Setup schema

1. Navigate to `src/common/graphql-api/schema`
2. Add a new record schema with Zod. Be sure to follow file naming convention
   ```jsx
   const AddJobSchema = z.object({
     id: z.string(),
     code: z.string(),
     name: z.string(),
     status: z.string().optional(),
   });
   ```

### **Part 2**: Create form component

1. Go to your module directory and the new React form component.
2. Import the record schema as form resolver. [Snippet example](https://github.com/react-hook-form/resolvers#zod)

   ```jsx
   import React from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { AddJobFormSchema, TAddJobForm } from 'common/graphql-api/schema/project';

   const App = () => {
     const { register, handleSubmit } =
       useForm <
       TAddJobForm >
       {
         resolver: zodResolver(AddJobFormSchema),
       };

     return (
       <form onSubmit={handleSubmit(d => console.log(d))}>
         <input {...register('name')} />
         <input {...register('age')} type="number" />
         <input type="submit" />
       </form>
     );
   };
   ```

   > Use available form fields [here](https://storybook.embraceapp.link/?path=/story/components-molecules-formfields-textfield--default)

### **Part 3**: Form submission with API

Use model operations available in API to process form submissions.

Here's what this function looks like

```jsx
import createJob from 'modules/afs/api/mutation/createJob/createJob';

// ...

const handleSubmit = async values => {
  await createJob(values);
};
```
