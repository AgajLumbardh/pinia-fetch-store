# pinia-fetch-store
A small library for request state management when using Pinia. The purpose of the library is to eliminate boilerplate code when fetching data is involved in web applications that use Pinia library.

## Installation

### Using the ES Module Build
You can use any of your preferred package managers to install the library.

```shell
  npx install pinia-fetch-store

  yarn add pinia-fetch-store

```

## Getting Started

Please find below an example of creating a todos Pinia fetch store.

```typescript
export const useTodosStore = defineStore('todos', createFetchStore({
  endpoints: (builder) =>({
    create: builder.create<Todo,CreateTodo>({
      async requestFn(payload){
        const response = await axios.post<Todo>('/api/todos', payload)
        this.listAction();
        return response.data;
      }
    }),
    list: builder.create<Todo[], void>({
      async requestFn(){
        const response = await axios.get<{data: Todo[]}>('/api/todos');
        return response.data.data;
      }
    }),
    update: builder.create<Todo, UpdateTodo>({
      async requestFn(payload) {
        const {id, ...body} = payload;
        const response = await axios.put<Todo>(`/api/todos/${id}`, body);
        this.listAction();
        return response.data;
      }
    }),
    delete: builder.create<void, string>({
      async requestFn (id) {
        await axios.delete(`/api/todos/${id}`);
        this.listAction();
      }
    })
  })
}));

```
Then, we can start consuming the store from our Vue components.

```typescript

const store = useTodosStore();

const listData = store.list.data 
const isListLoading = store.list.isLoading;

// You can also use the computed() method to make the state reactive
const isDeleteLoading = computed(() => store.delete.isLoading)

// For each endpoint the library creates a getter method (adding 'Computed' as suffix to the endpoint name)
store.listComputed.data
store.listComputed.isLoading

// For each endpoint the library creates an action method (adding 'Action' as suffix to the endpoint name)
store.listAction();

```

## APIs
### createFetchStore()
Th sole exported method which allows you to define a Pinia store

- **Syntax**
```typescript
createFetchStore<E extends Endpoints>({endpoints}: CreateFetchStoreOptions<E>): FetchStoreDefinition<E>
```
- **Parameters**
  - **endpoints**: a callback function which must return an object literal with API endpoints. The callback function accepts EndpointBuilder object as parameter.
      #### Important Types
      - **EndpointBuilder**: an object with create() method that allows you to write your API endpoints.
        ```typescript
        type EndpointBuilder  = {
          create<ResultType,RequestArg>(definition: EndpointDefinition<ResultType, RequestArg>): EndpointDefinition<ResultType, RequestArg>;
        }
        ```
      - **Endpoints**: an object literal that contains API endpoint definitions.
        ```typescript
        type Endpoints = Record<string, EndpointDefinition<any, any>>;
        ```
      - **EndpointDefinition**: describes how an API endpoint retrieves the data from the server. The first generic parameter defines the result type which requestFn() must return whereas the second generic parameter defines the type of the parameter which requestFn() accepts (if it has any).
        ```typescript
          export type EndpointDefinition<ResultType, RequestArg> = {
            requestFn(arg: RequestArg): MaybePromise<ResultType>;
          };
        ```
- **Return value**
  - A Pinia store with the state, getters, and actions for each API endpoint.
      #### Important Types
      - **FetchStoreDefinition**: defines a Pinia store.
        ```typescript
          type FetchStoreDefinition<E extends Endpoints> = {
            state: () => FetchStoreState<E>;
            getters: FetchStoreGetters<E>;
            actions: FetchStoreActions<E>;
          };
        ``` 
      - **FetchStoreRequestState**: defines the state of each API endpoint request.
        ```typescript
        type FetchStoreRequestState<E extends EndpointDefinition<any, any>> = {
          isLoading: boolean;
          hasError: boolean;
          error: any | null;
          data: ResultTypeFrom<E> | null;
        };
        ```

## Caveats
Please find below some of the quirky traits that come with the library implementation:
- the library will ignore the request if a previous request has not finished loading.
- the library is weakly typed with 'this' reference in requestFn() method implementation. It only expects a method whose suffix is 'Action' and it does not check if the action method actually is found in the store.


## Feature Requests
- create actions for each endpoint that clear the request state, e.g. clearListAction().
- caching: build a mechanism to fetch data from server only when it becomes invalid.