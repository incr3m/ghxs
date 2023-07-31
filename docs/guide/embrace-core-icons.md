# How to add embrace core icons?

## Table of Contents

- ### [Identify icon source](#identify-icon-source)
- ### [Create icon file](#create-icon-file)
- ### [Copy icon's SVG code](#copy-icons-svg-code)
- ### [Include newly added icon to icon stories](#include-newly-added-icon-to-icon-stories)
- ### [How to use newly added icon?](#how-to-use-newly-added-icon)
- ### [Icon with gradient variant: how to use?](#icon-with-gradient-variant-how-to-use)

# Identify icon source

You should have a source of SVG icons where you’ll be able to fetch its SVG code.

![How a figma source looks like?](https://user-images.githubusercontent.com/12273930/215495201-17122279-1665-4c95-968d-5468a30a6d99.png)

Source examples:

- [AFS Figma](https://www.figma.com/file/vceAKdYXnnPD6FCnRqazAQ/AFS?node-id=31%3A32&t=omhnPQkGlP91haHi-1)
- [Embrace Figma](https://www.figma.com/file/MC3bV0m1O2JelUfwQExt6H/Embrace?t=4J847x1CJlyKV5RJ-0)

# Create icon file

On your embrace-v2 directory, go to: `apps/main/src/icons`

Create a new typescript react file (.tsx) and name it according to the name of the icon.

![Where to create a new icon file?](https://user-images.githubusercontent.com/12273930/215495759-0b396b4f-c2ec-4281-8cae-3f8a4dd02978.png)

For example, let's use the icon below (Cart) to create a new icon:

![Creating a Cart embrace icon](https://user-images.githubusercontent.com/12273930/215495937-231aa88d-64ae-4b35-bf72-740cd37ad1f7.png)

Create a new file named (use camel case naming convention): `Cart.tsx`

Use the code template below for the newly created icon component. We will edit this further to add our new icon.

```tsx
import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

import { RenderSVGIconGradient } from './gradient/SvgIconGradient';

import { TSvgIcon } from './icon.type';

function [[ Icon Name Here... ]](props: TSvgIcon) {
  // This takes effect on SVG icon components who's on default has
  // gradient but another instance requires it to be single color
  // @ts-ignore
  const gradientDisabled = props.gradient && !props.gradient.disabled;

  return (
    <SvgIcon {...props}>
      <g fill={gradientDisabled ? 'url(#linear)' : 'inherit'}>

        [[ SVG icon path code here later... ]]

      </g>
      {props.gradient && RenderSVGIconGradient(props.gradient)}
    </SvgIcon>
  );
}

export default [[ Icon Name Here... ]];
```

You’ll notice the `[[ Icon Name Here… ]]` on the starter code. Replace it with the name of the icon. In this case, we use `Cart`.

```tsx
function Cart(props: TSvgIcon) {
  ... // rest of the code here
}

export default Cart;
```

# Copy icon's SVG code

Also, on the starter code, you’ll notice this: `[[ SVG icon path code here later... ]]`.

This is where we will paste the SVG icon’s code from our source.

The process may differ depending on the icon source, but for this guide, we’re fetching our SVG code from figma.

> What we are looking for in the SVG code are the paths (`<path>`). Some icons would include different tags elements such as `<rect>`, `<g>`, `<stroke>`, and etc. We will remove these when we paste our SVG code to our icon component file.
>
> There will also be times that you may need to convert your icon code to be able to extract the path. Do not heistate to ask for help when these situations arise.

To extract an SVG icon code, go to figma, select the entirety of the icon and right click. Look for **Copy/Paste as** > **Copy as SVG**:

![Extract SVG code from figma](https://user-images.githubusercontent.com/12273930/215496127-4b5e8481-2a99-4d00-9715-4e27cbc7a952.png)

The copied SVG code should look similarly to this:

```svg
<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.55976 2.06048C3.72244 2.02226 3.89365 2.00216 4.07125 2.00254L18.0407 3.00036C19.2924 3.02246 20.5171 4.06045 19.9125 5.40906C19.7948 5.67166 19.2632 6.74107 18.418 8.4238C18.0729 9.11076 17.7188 9.81392 17.3647 10.5159C17.164 10.9135 17.164 10.9135 17.0224 11.194C16.9575 11.3224 16.9323 11.3724 16.917 11.4025C16.6296 12.1416 16.0227 12.7126 15.2645 12.9532L15.1169 13H5.038L5.02369 12.9993L3.04955 12.9988C2.48131 13.027 2.02697 13.4813 2 14L1.99821 14.9401C2.03254 15.5124 2.49001 15.9694 3 16H3.17071C3.58254 14.8348 4.69378 14 6 14C7.30622 14 8.41746 14.8348 8.82929 16H11.1707C11.5825 14.8348 12.6938 14 14 14C15.6569 14 17 15.3431 17 17C17 18.6569 15.6569 20 14 20C12.6938 20 11.5825 19.1652 11.1707 18H8.82929C8.41746 19.1652 7.30622 20 6 20C4.69331 20 3.58174 19.1646 3.17026 17.9987L2.94324 17.9984C1.36275 17.9085 0.0968212 16.6439 0 15L0.00122857 13.9504C0.0801976 12.3588 1.35036 11.0856 2.98992 11.0005L2.01005 4.14142L2 4C2 3.35306 1.67086 2.58508 1.29289 2.20711C1.1949 2.10911 0.758448 2 0 2V0C1.24155 0 2.13843 0.224221 2.70711 0.792893C3.04216 1.12794 3.33674 1.56893 3.55976 2.06048ZM5.11287 11H14.7694C14.9028 10.9274 15.0065 10.8078 15.0588 10.6622L15.1076 10.5488C15.1311 10.5023 15.1311 10.5023 15.2371 10.2923C15.3786 10.0122 15.3786 10.0122 15.579 9.61507C15.9326 8.91405 16.2863 8.21186 16.6163 7.55493L16.6308 7.52609C17.2089 6.37516 17.6505 5.49032 17.8934 4.99493L4.01026 4.00073L4.99015 10.86C4.99973 10.9278 5.04866 10.9822 5.11287 11ZM14 18C14.5523 18 15 17.5523 15 17C15 16.4477 14.5523 16 14 16C13.4477 16 13 16.4477 13 17C13 17.5523 13.4477 18 14 18ZM6 18C6.55228 18 7 17.5523 7 17C7 16.4477 6.55228 16 6 16C5.44772 16 5 16.4477 5 17C5 17.5523 5.44772 18 6 18Z" fill="black"/>
</svg>
```

What we only need in this chunk of code is the `<path>`. Before we copy the path, let’s remove its other properties. The "**`d`**" property should remain.

Your SVG code should now look like this:

```svg
<path d="M3.55976 2.06048C3.72244 2.02226 3.89365 2.00216 4.07125 2.00254L18.0407 3.00036C19.2924 3.02246 20.5171 4.06045 19.9125 5.40906C19.7948 5.67166 19.2632 6.74107 18.418 8.4238C18.0729 9.11076 17.7188 9.81392 17.3647 10.5159C17.164 10.9135 17.164 10.9135 17.0224 11.194C16.9575 11.3224 16.9323 11.3724 16.917 11.4025C16.6296 12.1416 16.0227 12.7126 15.2645 12.9532L15.1169 13H5.038L5.02369 12.9993L3.04955 12.9988C2.48131 13.027 2.02697 13.4813 2 14L1.99821 14.9401C2.03254 15.5124 2.49001 15.9694 3 16H3.17071C3.58254 14.8348 4.69378 14 6 14C7.30622 14 8.41746 14.8348 8.82929 16H11.1707C11.5825 14.8348 12.6938 14 14 14C15.6569 14 17 15.3431 17 17C17 18.6569 15.6569 20 14 20C12.6938 20 11.5825 19.1652 11.1707 18H8.82929C8.41746 19.1652 7.30622 20 6 20C4.69331 20 3.58174 19.1646 3.17026 17.9987L2.94324 17.9984C1.36275 17.9085 0.0968212 16.6439 0 15L0.00122857 13.9504C0.0801976 12.3588 1.35036 11.0856 2.98992 11.0005L2.01005 4.14142L2 4C2 3.35306 1.67086 2.58508 1.29289 2.20711C1.1949 2.10911 0.758448 2 0 2V0C1.24155 0 2.13843 0.224221 2.70711 0.792893C3.04216 1.12794 3.33674 1.56893 3.55976 2.06048ZM5.11287 11H14.7694C14.9028 10.9274 15.0065 10.8078 15.0588 10.6622L15.1076 10.5488C15.1311 10.5023 15.1311 10.5023 15.2371 10.2923C15.3786 10.0122 15.3786 10.0122 15.579 9.61507C15.9326 8.91405 16.2863 8.21186 16.6163 7.55493L16.6308 7.52609C17.2089 6.37516 17.6505 5.49032 17.8934 4.99493L4.01026 4.00073L4.99015 10.86C4.99973 10.9278 5.04866 10.9822 5.11287 11ZM14 18C14.5523 18 15 17.5523 15 17C15 16.4477 14.5523 16 14 16C13.4477 16 13 16.4477 13 17C13 17.5523 13.4477 18 14 18ZM6 18C6.55228 18 7 17.5523 7 17C7 16.4477 6.55228 16 6 16C5.44772 16 5 16.4477 5 17C5 17.5523 5.44772 18 6 18Z" />
```

> There are some icons who will have several `<path>` elements in it. Always include all available `<path>` elements in the code and remove all properties except the “**`d`**” property.

Finally, copy the trimmed SVG code to your icon component file. Your final `Cart.tsx` component should look like this:

```tsx
import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

import { renderSVGIconGradient } from './gradient/SvgIconGradient';

import { TSvgIcon } from './icon.type';

function Cart(props: TSvgIcon) {
  // This takes effect on SVG icon components who's on default has
  // gradient but another instance requires it to be single color
  // @ts-ignore
  const gradientDisabled = props.gradient && !props.gradient.disabled;

  return (
    <SvgIcon {...props}>
      <g fill={gradientDisabled ? 'url(#linear)' : 'inherit'}>
        <path d="M3.55976 2.06048C3.72244 2.02226 3.89365 2.00216 4.07125 2.00254L18.0407 3.00036C19.2924 3.02246 20.5171 4.06045 19.9125 5.40906C19.7948 5.67166 19.2632 6.74107 18.418 8.4238C18.0729 9.11076 17.7188 9.81392 17.3647 10.5159C17.164 10.9135 17.164 10.9135 17.0224 11.194C16.9575 11.3224 16.9323 11.3724 16.917 11.4025C16.6296 12.1416 16.0227 12.7126 15.2645 12.9532L15.1169 13H5.038L5.02369 12.9993L3.04955 12.9988C2.48131 13.027 2.02697 13.4813 2 14L1.99821 14.9401C2.03254 15.5124 2.49001 15.9694 3 16H3.17071C3.58254 14.8348 4.69378 14 6 14C7.30622 14 8.41746 14.8348 8.82929 16H11.1707C11.5825 14.8348 12.6938 14 14 14C15.6569 14 17 15.3431 17 17C17 18.6569 15.6569 20 14 20C12.6938 20 11.5825 19.1652 11.1707 18H8.82929C8.41746 19.1652 7.30622 20 6 20C4.69331 20 3.58174 19.1646 3.17026 17.9987L2.94324 17.9984C1.36275 17.9085 0.0968212 16.6439 0 15L0.00122857 13.9504C0.0801976 12.3588 1.35036 11.0856 2.98992 11.0005L2.01005 4.14142L2 4C2 3.35306 1.67086 2.58508 1.29289 2.20711C1.1949 2.10911 0.758448 2 0 2V0C1.24155 0 2.13843 0.224221 2.70711 0.792893C3.04216 1.12794 3.33674 1.56893 3.55976 2.06048ZM5.11287 11H14.7694C14.9028 10.9274 15.0065 10.8078 15.0588 10.6622L15.1076 10.5488C15.1311 10.5023 15.1311 10.5023 15.2371 10.2923C15.3786 10.0122 15.3786 10.0122 15.579 9.61507C15.9326 8.91405 16.2863 8.21186 16.6163 7.55493L16.6308 7.52609C17.2089 6.37516 17.6505 5.49032 17.8934 4.99493L4.01026 4.00073L4.99015 10.86C4.99973 10.9278 5.04866 10.9822 5.11287 11ZM14 18C14.5523 18 15 17.5523 15 17C15 16.4477 14.5523 16 14 16C13.4477 16 13 16.4477 13 17C13 17.5523 13.4477 18 14 18ZM6 18C6.55228 18 7 17.5523 7 17C7 16.4477 6.55228 16 6 16C5.44772 16 5 16.4477 5 17C5 17.5523 5.44772 18 6 18Z" />
      </g>
      {props.gradient && renderSVGIconGradient(props.gradient)}
    </SvgIcon>
  );
}

export default Cart;
```

Congratulations! You have added a new icon component to your embrace core icon collection.

# Include newly added icon to icon stories

As part of our documentation process, we are also required to add our icon to our storybook stories.

This is how our iconography story looks like right now:

![Iconography in Storybook](https://user-images.githubusercontent.com/12273930/215496425-bc319728-e187-435b-9782-91b717cd25f4.png)

To properly include your newly added icon to the icon base, run this command to your terminal while under the embrace-v2 directory: `yarn codegen`

> There might be some cases that running the command above may produce runtime errors. As of the moment, the command runs smoothly under the following versions of yarn and node:
>
> - 1.22.19 - yarn
> - v16.18.1 - node
>
> Try to match the versions above if you experience runtime errors.

To access embrace storybook and check our icon base, run the following command: `yarn storybook`

# How to use newly added icon?

To use newly added icon, just import the icon component on the file which the icon will be used. Your imports would normally look like this:

```tsx
import Cart from 'icons/Cart';
```

You may also refer to storybook under **Icons** > **Base Icon** for a basic use case example of our icon component:

![Base Icon in Storybook](https://user-images.githubusercontent.com/12273930/215496614-236ddc21-a43f-432a-bb61-687b2004a439.png)

> Base icon displayed under storybook’s canvas. The “dashboard” icon is used for demonstration. Just change the name of the component to the corresponding icon as per requirement. (i.e. `<Dashboard />` to `<Cart />`)

![Base Icon viewed at Storybook docs tab](https://user-images.githubusercontent.com/12273930/215496939-ad531690-425a-4668-a909-f96dde02dcb1.png)

> You’ll also notice that you can copy the icon component code when you visit the “Docs” section. A number of icon props are made available for testing:
>
> - `htmlColor` - string; should be hex color string, sets the color of the icon
> - `fontSize` - string; any of the pre-made selection `[”large”, “medium”, “small”]`
>
> Our icon component is built thru MUI’s `SvgIcon` component. To learn more about the `SvgIcon` MUI component, visit this link: https://mui.com/material-ui/api/svg-icon/

# Icon with gradient variant: how to use?

We’ve also configured our icon component to support a gradient color fill.

To use this feature, import your icon just like how you import our base icon.

Add the `gradient` property to the component.

Refer to the details below on what to pass to the `gradient` property.

```tsx
import Dashboard from 'icons/Dashboard';

// other code goes here

<Dashboard
  gradient={{
    firstColor: '#FA126C', // string, hex, required. 1st color of the gradient
    secondColor: '#FF9F4B', // string, hex, required. 2nd color of the gradient
    toLeft: true, // optional, controls linear direction of gradient (default: true)
    toUpward: false, // optional, controls linear direction of gradient (default: false)
    toRight: false, // optional, controls linear direction of gradient (default: false)
    toDownward: false, // optional, controls linear direction of gradient (default: false)
  }}
/>;
```

> Please note that you may also just pass the `gradient` prop as it is to the component without adding any other specific attributes (i.e. `<Cart gradient />`).
>
> The gradient colors will be fetched from the theme's default gradient colors.

You may refer to our icon’s storybook gradient story (**Icons** > **Icon Gradient**) to experiment with the color combination and the linear direction properties of the the icon.

![Icon Gradient in Storybook](https://user-images.githubusercontent.com/12273930/215496992-44904121-27f7-4ab9-b9a7-ce0278186196.png)
