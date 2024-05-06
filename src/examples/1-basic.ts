import { defineStore } from "pinia";
import { createFetchStore } from "../createFetchStore";

export interface Todo {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface CreateTodo {
  name: string;
  isCompleted: boolean;
}

export interface UpdateTodo extends Partial<CreateTodo> {
  id: string;
}

const todosStore = createFetchStore({
  endpoints: (builder) => ({
    create: builder.create<Todo, CreateTodo>({
      requestFn: async (newTodo) => {
        console.log("Creating todo item");
        return Promise.resolve<Todo>({ id: "5", ...newTodo });
      },
    }),
    retrieve: builder.create<Todo, string>({
      requestFn: async (id) => {
        console.log("Retrieving todo item with id:", id);
        return Promise.resolve<Todo>({
          id: "1",
          name: "Lunch with Jon Doe",
          isCompleted: false,
        });
      },
    }),
    list: builder.create<Todo[], void>({
      requestFn: async () => {
        console.log("Listing todo items");
        return Promise.resolve<Todo[]>([
          { id: "1", name: "Lunch with Joe Doe", isCompleted: false },
        ]);
      },
    }),
    update: builder.create<Todo, UpdateTodo>({
      requestFn: async (updateTodo) => {
        console.log("Updating a todo item with id:", updateTodo.id);
        return Promise.resolve<Todo>({
          id: "1",
          name: updateTodo.name ?? "Lunch with Joe Doe",
          isCompleted: updateTodo.isCompleted ?? false,
        });
      },
    }),
    delete: builder.create<void, string>({
      async requestFn(id) {
        console.log("Deleting a todo item with id:", id);
        this.listAction();
      },
    }),
  }),
});

export const useTodosStore = defineStore("todos", todosStore);
