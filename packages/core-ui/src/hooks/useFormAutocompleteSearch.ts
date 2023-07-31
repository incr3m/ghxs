import { useState, useMemo, useCallback } from 'react';
import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import debounce from 'lodash/debounce';

type TQOptions<TQueryKey extends QueryKey = QueryKey> = UseQueryOptions<
  unknown,
  unknown,
  unknown,
  TQueryKey
>;

type TUseFormAutocompleteSearch<T extends FieldValues, QK extends QueryKey = QueryKey> = {
  form: UseFormReturn<T>;
  name: string;
  queryKey: TQOptions<QK>['queryKey'];
  queryFn: TQOptions<QK>['queryFn'];
  getOptionLabel?: (item: T) => string;
};

const useFormAutocompleteSearch = <
  T extends FieldValues,
  QK extends QueryKey = QueryKey,
>({
  form,
  name,
  queryKey,
  getOptionLabel,
  queryFn,
}: TUseFormAutocompleteSearch<T, QK>) => {
  const [inputValue, setInputValue] = useState('');

  const optionField = form.watch(name as Path<T>);

  const transform = useCallback(
    (result: Nullable<T[]>) => {
      const options = result?.map?.(item => {
        const label = getOptionLabel?.(item) ?? '';
        return {
          label,
          value: item?.id,
          id: item?.id,
          _source: item,
        };
      });
      return { options };
    },
    [getOptionLabel],
  );

  const state = useMemo(
    () => ({ searchText: inputValue, ids: [optionField] }),
    [inputValue, optionField],
  );

  const opts = {
    queryKey: typeof queryKey === 'function' ? (queryKey as Function)?.(state) : queryKey,
    queryFn: async (...args) => {
      const result = await queryFn?.(...args);
      return result ?? [];
    },
    select: transform,
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ['data'],
  } as TQOptions<QK>;

  const qResults = useQuery(opts);

  const data = qResults.data as ReturnType<typeof transform>;
  const status = qResults.status;

  const result = useMemo(() => {
    return {
      bind: {
        name,
        control: form.control,
        options: data?.options ?? [],
        loading: status === 'loading',
        // freeSolo: true,
        // autoSelect: true,
        filterOptions: (x: T) => x,
        onInputChange: debounce((event, newInputValue, reason) => {
          console.log('INPUT_CHANGE', { event, newInputValue, reason });
          if (!event) return;
          const { type } = event;
          if (reason !== 'input' || ['blur', 'click'].includes(type) || !event) return;
          setInputValue(newInputValue);
        }, 500),
      },
    };
  }, [data?.options, form.control, name, status]);
  return result;
};

export default useFormAutocompleteSearch;
