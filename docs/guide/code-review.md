## Code Review Checklist

---

- **Check for imports**, as sometimes tree shaking is not working as you wish, and you could bundle the whole library and use just a single method like below:

  ```tsx
  import _ from 'lodash';
  //should became more precise import like:
  import uniq from 'lodash/uniq';
  ```

- **Check for missing or invalid types** if you are using TypeScript. All `ANY` types should also be fixed unless you have a really, really good explanation for not doing so. Below we have a missing props types and any in the method.

  ```tsx
  const NewComponent = ({ items, data }) => {
    const getItemId = (data: any) => data.id;
    return (
      <div>
        {items.map(item => (
          <span key={getItemId(item)}>
            <h1>{item.title}</h1>
            <p>{item.description}</p>
          </span>
        ))}
      </div>
    );
  };
  ```

- **Check for abusive inline eslint-disable rules**, make sure to eslint rules are followed. Disabling eslint on specific file or line should not be allowed unless there's a valid reason.

- **Check for variables, functions, and components names**. They should all declare what they are and what they do.

- **For boolean values it’s good to have a prefix** `is/are/should` which declares their behaviour `(visible => isVisible)` and it will be harder to treat them as html properties.

- **Functions should declare what they do**, and if they return anything, they should have something like `get – getUsers`, if they are manipulating data, they should somehow tell what they are doing – `updateUsers => addUniqId`, `parseData => parseToAPIFormat` etc.

- **Check for weird logic patterns** (things you have never seen before). Sometimes when a developer takes too much time on a single task – they start to be really creative and create methods or flow that have no sense at all. You should help them here – to point that out and maybe help with a better solution.

- **Check for too complicated code chunks**. If someone is adding an ID into an array using 20 lines of code instead of 1, take some actions. Or when you are using some 3rd party packages like lodash, but the developer keeps writing all the methods by himself.

- **If you can’t understand what a specific chunk of code is doing** – we need to add a description comment there, or it’s just written incorrectly. In case the first option is viable – add a comment with description. You can come back to this point in the future – and you still know what it does. If it’s incorrect – it needs fixing.

- **Check for hardcoded names, paths, values**. Separate that kind of code, so you can easily change it in one place. Use paths instead. They are (in most cases) used in routing configuration and in every link and redirection. Also, separate types, date formats and everything that can be used in multiple places – to easily change them.

- **Check for backwards compatibility issues** like changes in props from _**optional**_ to _**required**_. Or changes in some methods parameters types. If you made such a change with TypeScript – it should throw a compilation error. If you are using just JavaScript – you need to track that manually.

- **Check for code repetition**. If you’ve seen the same/similar logic in multiple places – point that out. Code should be reusable and if you will need to update that logic, you will have to update it in a single place. Not 3 of them.

- **Check for async methods** – can they be done in parallel, or we need all the data in a sequence? Check if we actually wait for this data if we need it, or we read from promise object.

- **Sometimes you may notice potential bugs**. A big part of knowledge comes with the experience. If you see something you’ve done in the past, but it caused errors – don’t make it happen again. Explain that you’ve been there, and you know the way out as you’ve made it working before.
