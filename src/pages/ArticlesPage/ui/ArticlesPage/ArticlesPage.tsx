import { useTranslation } from "react-i18next";
import { memo, useCallback, useEffect } from "react";

import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchNextArticlesPage } from "../../model/services/fetchNextArticlesPage/fetchNextArticlesPage";
import { initArticlesPage } from "../../model/services/initArticlesPage/initArticlesPage";
import {
  articlesPageActions,
  articlesPageReducer,
  getArticles,
} from "../../model/slices/articlesPageSlice";
import cls from "./ArticlesPage.module.scss";
import {
  getArticlesPageError,
  getArticlesPageIsLoading,
  getArticlesPageView,
} from "../../model/selectors/articlesPageSelectors";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import DynamicModuleLoader, {
  ReducersList,
} from "@/shared/lib/components/DynamicModuleLoader/DynamicModuleLoader";
import { ArticlesPageFilters } from "../ArticlesPageFilters/ArticlesPageFilters";
import { Page } from "@/widgets/Page/Page";
import { classNames } from "@/shared/lib/classNames/classNames";
import { ArticleList } from "@/entities/Article/ui/ArticleList/ArticleList";
import { ArticleInfiniteList } from "../ArticleInfiniteList/ArticleInfiniteList";

interface ArticlesPageProps {
  className?: string;
}

const reducers: ReducersList = {
  articlesPage: articlesPageReducer,
};

const ArticlesPage = (props: ArticlesPageProps) => {
  const { className } = props;
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const onLoadNextPart = useCallback(() => {
    dispatch(fetchNextArticlesPage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(initArticlesPage(searchParams));
  }, [dispatch, searchParams]);

  return (
    <DynamicModuleLoader reducers={reducers} removeAfterUnmount={false}>
      <Page
        onScrollEnd={onLoadNextPart}
        className={classNames("", {}, className ? [className] : [])}
      >
        <ArticlesPageFilters />
        <ArticleInfiniteList className={cls.list} />
      </Page>
    </DynamicModuleLoader>
  );
};

export default memo(ArticlesPage);
