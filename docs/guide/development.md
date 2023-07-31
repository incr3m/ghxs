# Development

## Workflow

- [Setup Embrace](/docs/guide/development.md#setup-pre-requisites-needs-to-be-installed)
- [Pull Request Template](/.github/PULL_REQUEST_TEMPLATE.md)
- [Directory Guide](/docs/guide/directory-guide.md)

---

## Values

### As a developer:

- Communicate often status reports on what they are working on and what they have achieved
- Asks questions if there is a clear blocker caused by anything project related or information missing on anything project related. Consults open documentations for everything else.
- Makes proactive proposals if necessary and challenges things that don't make sense to them
- Is interested in the project because they want to learn about and designing a SaaS architecture and the used tools

### Big no-nos

- Copy paste logic of stuff that could clearly be DRY
- Extensive lazy variable naming and typos
- Dragging out work behind "debugging sessions" -> if you encounter any blocker rather communicate first

---

## Setup Pre-requisites (needs to be Installed)

1. [Node JS](https://nodejs.org/en/). Use LTS 16 node version.
2. [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable)
3. [Git ](https://git-scm.com/)
4. Added **ssh-keys** from your Machine to your Github [https://www.atlassian.com/git/tutorials/git-ssh](https://www.atlassian.com/git/tutorials/git-ssh)
5. Embrace repository cloned locally. `git clone git@github.com:moreton-blue-software/embrace-v2.git`

---

## Feature branch development

1. Go to your task assignment in Github.
2. Create a new branch

   ![image](https://user-images.githubusercontent.com/3125784/228727011-ad709f72-494e-4c55-883d-9578214b41de.png)

3. Pull the branch on your local device and start developing. Mark it as Draft ideally if it's still ongoing.
4. Make a PR once done. Make sure to follow this [template](https://github.com/moreton-blue-software/embrace-v2/blob/master/.github/PULL_REQUEST_TEMPLATE.md)

## Frontend Development

1. run `cd embrace-v2`
2. run `yarn install`
3. run `yarn start` (starts dev server with all features enabled) or `yarn start:instance <instance_code>` (starts with all instance features enabled)
4. open http://localhost:3000

#### Running Storybook

1. run `cd embrace-v2`
2. run `yarn install`
3. run `yarn storybook`
4. open http://localhost:6006

#### Guides

- [Feature flag](/docs/guide/feature-flag.md)
- [Building forms](/docs/guide/building-forms.md)
- [Basic API querying](/docs/guide/api-query.md)
- [Storybook testing](/docs/guide/storybook-tests.md)
- [Creating embrace core icons](/docs/guide/embrace-core-icons.md)
- [Creating embrace core keywords](/docs/guide/embrace-core-keywords.md)

---

## API

1. run `cd embrace-v2`
2. run `yarn install`
3. run `yarn dev:api`

#### Guides

- [Creating new APIs with TDD](/docs/guide/api-development.md#adding-new-api-function)
- [Mock zod schema](/docs/guide/api-development.md)
- [Advance queries](/docs/guide/api-development.md)

## Backend

1. navigate to `cdk-backend/lib/lambda/legacy-functions/<lambda-function>`
2. add/update the following files under `__tests__` directory:
   - `<function_name>.data.js` - test data
   - `<function_name>.json` - lambda test event param
   - `<function_name>.test.js` - unit test specs
3. run `sh tests.sh --watch` to start test on watch mode

---

## Tooling

- [IDEs & Chrome extensions](/docs/guide/dev-tools.md)
