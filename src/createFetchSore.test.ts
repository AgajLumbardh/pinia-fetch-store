import { createFetchStore } from './createFetchStore';

interface Todo {
  id: string;
  name: string;
  isCompleted: boolean;
}

describe('createFetchStore()', () => {
  it('should build state', () => {
    const store = createFetchStore({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({
              id: '1',
              name: 'Finish Refactoring book',
              isCompleted: false,
            });
          },
        }),
      }),
    });

    expect(store.state()).not.toBeUndefined();
    expect(store.state().retrieve).not.toBeUndefined();
    expect(store.state().retrieve.isLoading).toEqual(false);
    expect(store.state().retrieve.hasError).toEqual(false);
    expect(store.state().retrieve.error).toEqual(null);
    expect(store.state().retrieve.data).toEqual(null);
  });

  it('should build getters', () => {
    const store = createFetchStore({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({
              id: '1',
              name: 'Finish Refactoring book',
              isCompleted: false,
            });
          },
        }),
      }),
    });

    expect(store.getters).not.toEqual({});
    expect(store.getters.retrieveComputed).not.toBeUndefined();
  });

  it('should build actions', async () => {
    const store = createFetchStore({
      endpoints: (builder) => ({
        retrieve: builder.create<Todo, string>({
          requestFn: async () => {
            return Promise.resolve<Todo>({
              id: '1',
              name: 'Finish Refactoring book',
              isCompleted: false,
            });
          },
        }),
      }),
    });

    expect(store.actions).not.toEqual({});
    expect(store.actions.retrieveAction).not.toBeUndefined();
  });
});
