import { ArticleDetailsSchema } from "@/entities/Article/model/types/articleDetailsSchema";
import { CounterSchema } from "@/entities/Counter";
import { UserSchema } from "@/entities/User";
import { AddCommentFormSchema } from "@/features/addCommentForm";
import { LoginSchema } from "@/features/AuthByUsername";
import { ProfileSchema } from "@/features/editableProfileCard";
import { UISchema } from "@/features/UI";
import { ArticleDetailsPageSchema } from "@/pages/ArticleDetailsPage/model/types";
import { ArticlesPageSchema } from "@/pages/ArticlesPage";
import { AdminPanelSchema } from "@/pages/AdminPanelPage/model";
import { rtkApi } from "@/shared/api/rtkApi";
import {
  AnyAction,
  EnhancedStore,
  Reducer,
  ReducersMapObject,
} from "@reduxjs/toolkit";
import { AxiosInstance } from "axios";
import { NavigateFunction } from "react-router-dom";

export interface StateSchema {
  counter: CounterSchema;
  user: UserSchema;
  ui: UISchema;
  [rtkApi.reducerPath]: ReturnType<typeof rtkApi.reducer>;

  // async reducers
  loginForm?: LoginSchema;
  profile?: ProfileSchema;
  articleDetails?: ArticleDetailsSchema;
  addCommentForm?: AddCommentFormSchema;
  articlesPage: ArticlesPageSchema;
  articleDetailsPage?: ArticleDetailsPageSchema;
  adminPanel?: AdminPanelSchema;
}

export type StateSchemaKey = keyof StateSchema;
export type MountedReducers = OptionalRecord<StateSchemaKey, boolean>;

export interface ReducerManager {
  getReducerMap: () => ReducersMapObject<StateSchema>;
  reduce: (state: StateSchema | undefined, action: AnyAction) => StateSchema;
  add: (key: StateSchemaKey, reducer: Reducer) => void;
  remove: (key: StateSchemaKey) => void;
  getMountedReducers: () => MountedReducers;
}

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
  reducerManager: ReducerManager;
}

export interface ThunkExtraArg {
  api: AxiosInstance;
  navigate: NavigateFunction;
}

export interface ThunkConfig<T> {
  rejectValue: T;
  extra: ThunkExtraArg;
  state: StateSchema;
}
