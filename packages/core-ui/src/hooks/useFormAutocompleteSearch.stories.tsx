import React from 'react';
import { useFormAutocompleteSearch } from './useFormAutocompleteSearch';
import FormAutocomplete from 'components-v2/molecules/form/FormAutocomplete';
import { QUERY_KEYS } from 'common/graphql-api/constants';
import { useForm } from 'react-hook-form';
import withApiManager from 'hoc/withApiManager';
import { Box } from '@mui/material';

export default {
  title: 'hooks/useFormAutocompleteSearch',
  parameters: {
    docs: {
      description: {
        component:
          'Meant to be used using FormAutocomplete component it exposes a bind object.',
      },
    },
  },
};

const Wrapper = ({ children }) => {
  return <>{children}</>;
};

const searchFakeUsers = async ({ searchText }) => {
  const { users = [] } =
    (await fetch(`https://dummyjson.com/users/search?limit=10&q=${searchText}`).then(
      res => res.json(),
    )) ?? {};
  return users;
};

export const Default = withApiManager(({ name = 'userId' }) => {
  const form = useForm();
  const { bind } = useFormAutocompleteSearch({
    form,
    name,
    queryKey: QUERY_KEYS.member.search,
    // the label per option (comes from the options array)
    getOptionLabel: item => `${item.firstName} ${item.lastName}`,
    queryFn: async ({ queryKey }) => {
      const [{ searchText }] = queryKey;
      const result = await searchFakeUsers({ searchText });
      return result;
    },
  });

  /**
   * used only on for checking the value on storybook
   */
  const watchValue = form.watch(name);
  console.log({ form, watchValue });
  return (
    <Wrapper>
      <FormAutocomplete
        textFieldProps={{
          label: 'Team Members',
          placeholder: 'Search team member',
        }}
        {...bind}
      />
      <Box mt={2}>Value: {watchValue}</Box>
    </Wrapper>
  );
});
