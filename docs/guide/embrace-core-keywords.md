# How to create and user embrace core keywords?

## Table of Contents

- ### [What are Keywords?](#what-are-keywords-1)
- ### [How to create a new set of keywords?](#how-to-create-a-new-set-of-keywords-1)
- ### [How to fetch our keywords?](#how-to-fetch-our-keywords-1)

# What are Keywords?

Embrace core has a feature wherein we can define a set of keywords for a specific field that is being used in the system.

To simplify, let's use the "Leave Type" field below:

![Leave type has a set of keywords defined](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/e4078764-7d95-43f4-91db-54e43bf56fec)

The entries found in the "Leave Type" field are not saved in the database but is defined on Embrace `Settings > Keywords` module.

![This is where keywords are defined](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/9148ce61-64ce-4e34-93a0-f6ab73ec817c)

# How to create a new set of keywords?

For an example, let's say that in the Team Members' profile, you needed to add a "Public Holidays" field and you need to have a pre-defined set of values that will be available for this field's drop-down selector.

![Public Holidays drop-down field but no options available](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/af030696-7d32-4daf-be0f-7a7eb3094bc3)

This is where our keywords become useful. Instead of hard-coding the options in our drop-down select, we utilize the keywords module so that our Embrace clients have the capacity to add or remove specific items in some of our fields (in this example, a team member's public holiday selection).

To start, on your VS Code editor, look for `apps/main/src/modules/settings/keywordsObjects.ts`

> VS Code pro-tip: Use `Ctrl + P (Cmd + P on mac)` and just type `keywordsObjects.ts` for faster access

Once you're on the file, you should be able to see several keyword objects defined in the file:

![Several keywords defined in keywordsObject.ts](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/383a4b30-a308-4d05-b765-f9ab9d54d75d)

We have a const variable named `keywords` which holds several keyword objects.

To add your desired keyword group, add an object. For our example, we'll add one for Public Holidays).

IMPORTANT: Please follow our naming convention for our keyword groups. Our standard naming convention for our keyword groups is camel-case naming, putting `kw` at the start of the name, followed by in what module this keyword will be used, and finally, the name of the field.

Following the rule above, we end up adding `kwTeamMemberPublicHolidays`.

Our `kwTeamMemberPublicHolidays`, or for any keyword group object that you will add, should contain three properties:

- module
- name
- description

![Adding in kwTeamMemberPublicHolidays keyword group object](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/afd06385-9885-4ee2-b4ec-b510861abc57)

The following properties should be easy to understand so please put the appropriate values accordingly.

Once you've saved your changes, go to Embrace and access the `Settings > Keywords` module. Look for the keyword group you've created.

> Tip: Use the keywords module search and key-in the name of your module

For our example, as you can see, we already have an empty `Public Holidays` keyword group which we can add keywords to.

![Public Holidays keyword group in Settings>Keyword module](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/d70466ec-7e2f-4edb-8f99-9b9fefbc7c19)

Click the edit keywords button (found on the far-right of the row) to start adding our keywords.

You should able to see this modal after:

![Public Holidays keyword modal](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/d8997e20-2a7a-44b8-a1b6-61718d87ecfd)

Add your keywords (click `Add Item` button to start adding) and save accordingly. In our case, let's add `Queensland` and `Victoria` for sample data purposes.

![Defining our Public Holidays' keywords](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/01a2b5a8-055f-483d-a408-9616ef7ec141)

Let's move on to the next section and learn how to fetch our keywords properly.

# How to fetch our keywords?

Continuing on our example, our Public Holidays dropdown select is in a file called `UserForm/index.tsx`

In our dropdown select component, we need to pass an array of options. This is where we gonna insert our newly created keyword group.

![Public Holidays select component with empty options](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/2df84b57-009e-4159-849b-ecdca72e7054)

To fetch our keywords, start with importing the `useKeywords` module from `components/SettingForm/useKeywords`.

![Importing useKeywords module](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/111936ad-75b9-43e8-9d56-12d183069e74)

Proceed by destructuring `kw` from the `useKeywords` function.

![Destructuring kw from useKeywords function](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/bd0a4a68-122c-43c5-b28e-234d47c15043)

The `useKeywords` function accepts an array of strings, wherein the strings should be the keyword group objects defined in our `keywordsObjects.ts` file. Only pass the keyword groups that you need in the component. For this case, the other keyword groups like `kwMemberTeamType` is needed in the component, hence it was included in the array.

As you'll notice, you'll find our `kwTeamMemberPublicHolidays` in the passed array of strings to the `useKeywords` function.

The destructured `kw` will now be an object of our keyword groups.

When we call our Public Holidays keyword group, it will be in the form of `kw.kwTeamMemberPublicHolidays`. The `kwTeamMemberPublicHolidays` property is an array of strings containing the keywords we've added in our `Settings > Keywords` module. Following our example, we should expect this array: `['Queensland', 'Victoria']`.

To finalize, pass the `kw.kwTeamMemberPublicHolidays` array to our Public Holidays select component.

![Inserting kw.kwTeamMemberPublicHolidays array to the select component](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/e0ee0891-e80d-4566-91a1-9ad31aa75222)

We can verify that our keywords are now being fetched and used when we view the Public Holidays select component in the Team Member edit profile page.

![Public Holidays select component is now populated with our Public Holidays defined keywords](https://github.com/moreton-blue-software/embrace-v2/assets/12273930/ebe3938c-4a04-4515-b69b-f780156d0fc3)

Enjoy working on your Embrace keywords!
