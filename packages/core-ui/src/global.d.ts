type EsRecord<T> = {
  _source: T;
  _type: '_doc';
};

type WithAttributes<T, A extends Zod.ZodType> = Omit<T, 'attributes'> & {
  attributes: Zod.infer<A>;
};

type AsQueryResult<T> = { result?: T };

type OptionalPromise<T> = T | Promise<T>;
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type ElementType<T extends Array<unknown> | undefined> = NonNullable<T>[number];
type ItemType<T extends Array<unknown> | undefined> = NonNullable<T>[number];

type CreateRecord<T> = Omit<T, 'id' | '__typename'>;
type UpdateRecord<T> = Partial<T> & { id: string };
type PutRecord<T> = Partial<T> & { id?: string };

type GetFirstParam<T> = NonNullable<Parameters<T>[0]>;
type SingleOrArray<T> = T | T[];
