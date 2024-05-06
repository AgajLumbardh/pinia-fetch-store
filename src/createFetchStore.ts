type MaybePromise<T> = T | PromiseLike<T>;

export type EndpointDefinition<ResultType, RequestArg> = {
  requestFn(arg: RequestArg): MaybePromise<ResultType>;
} & ThisType<AnyFetchStoreActions<any>>;

type ResultTypeFrom<E extends EndpointDefinition<any, any>> =
  E extends EndpointDefinition<infer RT, any> ? RT : unknown;

type RequestArgTypeFrom<E extends EndpointDefinition<any, any>> =
  E extends EndpointDefinition<any, infer AT> ? AT : unknown;

export type Endpoints = Record<string, EndpointDefinition<any, any>>;

type FetchStoreRequestState<E extends EndpointDefinition<any, any>> = {
  isLoading: boolean;
  hasError: boolean;
  error: any | null;
  data: ResultTypeFrom<E> | null;
};

export type EndpointBuilder = {
  create<ResultType, RequestArg>(
    definition: EndpointDefinition<ResultType, RequestArg>,
  ): EndpointDefinition<ResultType, RequestArg>;
};

type FetchStoreState<E extends Endpoints> = {
  readonly [K in keyof E]: FetchStoreRequestState<
    Extract<E[K], EndpointDefinition<any, any>>
  >;
};

type FetchStoreGetters<E extends Endpoints> = {
  readonly [K in keyof E as K extends string
    ? `${K}Computed`
    : never]: () => FetchStoreRequestState<
    Extract<E[K], EndpointDefinition<any, any>>
  >;
};

type FetchStoreActions<E extends Endpoints> = {
  [K in keyof E as K extends string ? `${K}Action` : never]: (
    arg: RequestArgTypeFrom<E[K]>,
  ) => void;
};

type AnyFetchStoreActions<E extends Endpoints> = {
  [K in keyof E as K extends string ? `${K}Action` : never]: (
    arg?: RequestArgTypeFrom<E[K]>,
  ) => void;
};

export type CreateFetchStoreOptions<E extends Endpoints> = {
  endpoints: (build: EndpointBuilder) => E;
};

export type FetchStoreDefinition<E extends Endpoints> = {
  state: () => FetchStoreState<E>;
  getters: FetchStoreGetters<E>;
  actions: FetchStoreActions<E>;
};

class EndpointBuilderImpl implements EndpointBuilder {
  create<ResultType, RequestArg>(
    definition: EndpointDefinition<ResultType, RequestArg>,
  ) {
    return definition;
  }
}

function buildState<E extends Endpoints>(endpoints: E): FetchStoreState<E> {
  const result: any = {};
  Object.keys(endpoints).forEach((aKey) => {
    result[aKey] = {
      isLoading: false,
      hasError: false,
      error: null,
      data: null,
    };
  });

  return result as FetchStoreState<E>;
}

function buildGetters<E extends Endpoints>(endpoints: E): FetchStoreGetters<E> {
  const getters: any = {};
  Object.keys(endpoints).forEach((name) => {
    getters[name + "Computed"] = (state: FetchStoreState<E>) => ({
      isLoading: state?.[name]?.isLoading,
      hasError: state?.[name]?.hasError,
      error: state?.[name]?.error,
      data: state?.[name]?.data,
    });
  });

  return getters as FetchStoreGetters<E>;
}

function buildActions<E extends Endpoints>(endpoints: E): FetchStoreActions<E> {
  const actions: any = {};
  Object.keys(endpoints).forEach((name) => {
    actions[name + "Action"] = async function (params: any) {
      let requestState = this?.[name] as any;

      if (requestState?.isLoading) {
        return;
      }

      this[name] = {
        isLoading: true,
        hasError: false,
        error: null,
        data: null,
      };

      try {
        const requestFn = endpoints?.[name]?.requestFn.bind(this);
        const data = await requestFn?.(params);
        this[name] = {
          isLoading: false,
          hasError: false,
          error: null,
          data,
        };
      } catch (error: any) {
        this[name] = {
          isLoading: false,
          hasError: true,
          error,
          data: null,
        };
      }
    };
  });

  return actions as FetchStoreActions<E>;
}

function createFetchStore<E extends Endpoints>({
  endpoints,
}: CreateFetchStoreOptions<E>): FetchStoreDefinition<E> {
  const definitions = endpoints(new EndpointBuilderImpl());
  const result = {
    state: () => buildState(definitions),
    getters: buildGetters(definitions),
    actions: buildActions(definitions),
  };

  return result;
}

export { createFetchStore };
