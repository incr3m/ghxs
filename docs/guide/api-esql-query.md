# ESQL Query API

OpenSearch SQL lets you write queries in SQL rather than the OpenSearch query domain-specific language (DSL).

To query SQL, use [esql](/src/common/libs/esql.ts) tool.

### Usage:

```ts
const res = await esql({
  index: ['user'],
  query: /*sql*/ `
        SELECT * FROM {{ user }} a WHERE a.email = 'admin@moretonblue.com'
      `,
});

const user = res[0] as User;
```

**More examples [here](/src/common/libs/esql.test.ts)**

---

### Tools

Use this [VSCode extension](https://marketplace.visualstudio.com/items?itemName=jtladeiras.vscode-inline-sql) to enable syntax highlighting.

---

### Limitations

Not all SQL operations are fully supported. See [here](https://opensearch.org/docs/latest/search-plugins/sql/limitation/) for details

---

### Todo

- Add more security features
