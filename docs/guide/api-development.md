## API Development

Embrace uses Test-driven development (TDD) to help increase confidence in the code we write. By writing tests before writing the code itself, we can ensure that the code meets the desired specifications and behaves as expected.

### Tools:

- [Vitest](https://vitest.dev/) - Testing framework. This wraps Jest APIs
- [Zod](https://zod.dev/) - Types and Schema validation
- [Zod-mock](https://www.npmjs.com/package/@anatine/zod-mock) - Mock data using Zod schema

---

### TDD

- Current file convention adds test file alongside the API file.

  ![image](https://user-images.githubusercontent.com/3125784/209652011-afd5255d-5a28-4425-a521-c798d66c8eb9.png)

- Contents of test file should follow Jest's test patterns.

  ##### Test Template

  ```js
  import { describe, it } from 'vitest';

  describe('My function', () => {
    test('should do something', () => {
      // Test code goes here
    });

    test('should do something else', () => {
      // Test code goes here
    });
  });
  ```

  For further reading, you may find these resources helpful:

  - [TDD](https://dev.to/pat_the99/basics-of-javascript-test-driven-development-tdd-with-jest-o3c)
  - [Jest Docs](https://jestjs.io/docs/getting-started)

### Adding new API function

1. Start Vitest server `yarn api:dev`
2. Create new function files under `src/common/graphql-api/<operation>/<module_name>`.
   - `<function_name>.ts` - contains function logic
   - `<function_name>.data.ts` - test data
   - `<function_name>.test.ts` - unit test specs
3. Copy test template file contents [here](/docs/guide/api-development.md#test-template)
4. import and call new function into the test file
5. Save and re-run test server
