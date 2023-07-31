import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Feature Flag" />

# Feature Flag/Guard

---

## There are 2 ways to use Feature Flag

1. Using `useFeature` hook of [Growthbook API](https://docs.growthbook.io/). [Feature definition](https://docs.growthbook.io/app/api#the-feature-object)
2. Using `<FeatureGuard/>` component.

## How it works

1. Define flag/s in `src/config-features.js`

- Define a **key** e.g. `FEATURE_BTN_ONE, FEATURE_BTN_TWO`
- Define an **instance**

  - instance is the subdomain of an URL which will determine if **useFeature** or **FeatureGuard** will be enabled/activated e.g. `mb2` from `mb2.embrace.technology`, `afsdev` from `afsdev.embrace.technology`
  - to force override instance code on development, just add the `VITE_INSTANCE_CODE` environment. e.g. ( `yarn start:instance afsdev` )
  - to force override instance code on browser, add `VITE_INSTANCE_CODE` search params (this also work on deployed instances). e.g.

    ![image](https://user-images.githubusercontent.com/3125784/202045991-cb9b1aa6-270c-4905-84f7-dafd7ba7ecd5.png)

## Sample config:

```js
// #1 Feature flag
MODULE_MENU: {
  // `defaultValue` is the return value of `useFeature` hook.
  defaultValue: true,
  rules: [
    {
      condition: {
        // Here's where you will define 'instances'
        instance: 'afsdev',
      },
      // `force` will override the 'defaultValue'
      force: false,
    },
    // You can define multiple conditions in every feature flag
    {
      condition: {
        instance: 'mb2',
      },
      force: false,
    },
  ],
},

// #2 Feature flag with custom `defaultValue`
MENU_MODULE_TASKS: {
  // You can customize the value of `defaultValue`
  defaultValue: {
    on: true,
    mode: '',
  },
  rules: [
    {
      condition: {
        instance: 'mb2',
      },
      force: {
        on: false,
        mode: 'disabled',
      },
    },
  ],
},

```

## How to use `useFeature`

```tsx
// import the `useFeature` hook.
import { useFeature } from '@growthbook/growthbook-react';

export default function Project() {
  // use `.on` if the `defaultValue` returns `true/false` like the `#1 Feature flag` above.
  // name the variable what ever seems fit.
  const isFeatureOn = useFeature('FLAG_KEY').on;

  return (
    // `isFeatureOn` will return `true/false`
    // You can use it in a if else condition like this
    <>
      isFeatureOn ? <Button>Button with flag</Button> : null
    </>
  );
}
```

```tsx
// import the `useFeature` hook.
import { useFeature } from '@growthbook/growthbook-react';

export default function Project() {
  // use `.value` if the `defaultValue` returns custom value like the `#2 Feature flag` above.
  // name the variable what ever seems fit.
  const { on, mode } = useFeature('FLAG_KEY').value;
  const isHidden = !on && mode === 'hidden';
  const isDisabled = !on && mode === 'disabled';

  if (isHidden) return null;

  return (
    // Sample usage
    <Button
      sx={{
        opacity: isDisabled ? 0.15 : 1,
        pointerEvents: isDisabled ? 'none' : 'initial',
        userSelect: isDisabled ? 'none' : 'initial',
      }}>
      Click me!
    </Button>
  );
}
```

## How to use `<FeatureGuard>`

- Please make sure you add the feature flag/s in the **config-features.js** and follow the config below
- `on` is `true` or `false`
- `mode` should be **'hidden'** or **'disabled'**

```js
MENU_MODULE_TASKS: {
  // You can customize the value of `defaultValue`
  defaultValue: {
    on: true,
    mode: '',
  },
  rules: [
    {
      condition: {
        instance: 'mb2',
      },
      force: {
        on: false,
        mode: 'disabled',
      },
    },
    {
      condition: {
        instance: 'afsdev',
      },
      force: {
        on: false,
        mode: 'hidden',
      },
    },
  ],
},

```

```tsx
// import the `FeatureGuard` hook.
import FeatureGuard from 'components-v2/molecules/FeatureGuard';

export default function Project() {
  return (
    // Wrap the component inside `<FeatureGuard/>` and make sure  pass a flagKey e.g. 'FEATURE_BTN_TWO'
    // The mode will depend on what you define in the `config-features.js`
    <FeatureGuard flagKey="FEATURE_BTN_TWO">
      <Button>Click me!</Button>
    </FeatureGuard>
  );
}
```

# Components the uses `<FeatureGuard>`

## Module Menu Items

- Make sure to follow this format when adding a feature flag for module tabs:`MENU_MODULE_NAME`
- Replace spaces with underscores and capitalize all letters

Example: `MENU_MODULE_DASHBOARD`

![image](https://user-images.githubusercontent.com/36387552/198192259-f0348844-ea4a-413e-aad4-d93a7e52a563.png)

```js
MENU_MODULE_DASHBOARD: {
  defaultValue: {
    on: true,
    mode: '',
  },
  rules: [
    {
      condition: {
        instance: 'mb2',
      },
      force: {
        on: false,
        mode: 'disabled',
      },
    },
  ],
},
```

## Tabs

- Make sure to follow this format when adding a feature flag for module tabs:`TAB_MODULE_TAB_NAME`
- Replace spaces with underscores and capitalize all letters

Example: `TAB_PROJECT_STAGES`

![Screenshot 2022-10-26 150727](https://user-images.githubusercontent.com/36387552/197958629-6fdba45e-5db7-4e41-8b8e-f5e310a7ab9f.png)

```js
TAB_PROJECT_STAGES: {
  defaultValue: {
    on: true,
    mode: '',
  },
  rules: [
    {
      condition: {
        instance: 'mb2',
      },
      force: {
        on: false,
        mode: 'disabled',
      },
    },
  ],
},
```

## Left Navigation Link

- Make sure to follow this format when adding a feature flag for left navigation links:`LEFT_NAV_LINK_TITLE_LINK_NAME`
- Replace spaces with underscores and capitalize all letters.

Example: `LEFT_NAV_LINK_CRM_MY_ACCOUNTS`

![image](https://user-images.githubusercontent.com/36387552/197709994-6ede746f-06de-49cb-9bff-0d0f251d042a.jpg)

```js
LEFT_NAV_LINK_CRM_BCC_EMAILS: {
  defaultValue: {
    on: true,
    mode: '',
  },
  rules: [
    {
      condition: {
        instance: 'mb2',
      },
      force: {
        on: false,
        mode: 'disabled',
      },
    },
  ],
},
```
