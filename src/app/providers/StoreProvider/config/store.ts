import {
  configureStore,
  ReducersMapObject,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";
import {
  StateSchema,
  ThunkExtraArg,
  ReduxStoreWithManager,
} from "./StateSchema";
import { counterReducer } from "@/entities/Counter";
import { userReducer } from "@/entities/User";
import { createReducerManager } from "./reducerManager";
import { $api } from "@/shared/api/api";
import { uiReducer } from "@/features/UI";
import { rtkApi } from "@/shared/api/rtkApi";

export function createReduxStore(initialState?: StateSchema) {
  const rootReducers = {
    counter: counterReducer,
    user: userReducer,
    ui: uiReducer,
    [rtkApi.reducerPath]: rtkApi.reducer,
  } as ReducersMapObject<StateSchema>;

  const reducerManager = createReducerManager(rootReducers);

  const store = configureStore({
    reducer: reducerManager.reduce,
    devTools: __IS_DEV__,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            api: $api,
          },
        },
      }).concat(rtkApi.middleware),
  });

  return Object.assign(store, { reducerManager }) as typeof store &
    ReduxStoreWithManager;
}

export type AppDispatch = ThunkDispatch<
  StateSchema,
  ThunkExtraArg,
  UnknownAction
>;
