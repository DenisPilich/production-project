import { useTranslation } from "react-i18next";
import { HTMLAttributeAnchorTarget, memo } from "react";
import { ArticleListItem } from "../ArticleListItem/ArticleListItem";
import cls from "./ArticleList.module.scss";
import { Article, ArticleView } from "../../model/types/article";
import { ArticleListItemSkeleton } from "../ArticleListItem/ArticleListItemSkeleton";
import { classNames } from "@/shared/lib/classNames/classNames";
import { Text } from "@/shared/ui/Text/Text";

interface ArticleListProps {
  className?: string;
  articles: Article[];
  isLoading?: boolean;
  target?: HTMLAttributeAnchorTarget;
  view?: ArticleView;
  virtualized?: boolean;
}

const getSkeletons = (view: ArticleView) =>
  new Array(view === ArticleView.SMALL ? 9 : 3)
    .fill(0)
    .map((item, index) => (
      <ArticleListItemSkeleton className={cls.card} key={index} view={view} />
    ));

export const ArticleList = memo((props: ArticleListProps) => {
  const {
    className,
    articles,
    view = ArticleView.SMALL,
    isLoading,
    target,
    virtualized = true,
  } = props;
  const { t } = useTranslation("article");

  const renderArticle = (article: Article) => (
    <ArticleListItem
      article={article}
      view={view}
      className={cls.card}
      key={article.id}
      target={target}
    />
  );

  if (virtualized) {
    return (
      <div
        className={classNames(
          cls.ArticleList,
          {},
          [className, cls[view]].filter((item): item is string =>
            Boolean(item),
          ),
        )}
      >
        {articles.length > 0 || isLoading ? (
          <div className={cls.list}>
            {articles.map(renderArticle)}
            {isLoading && getSkeletons(view)}
          </div>
        ) : null}
        {!isLoading && articles.length === 0 && <Text text={t("Статей нет")} />}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        cls.ArticleList,
        {},
        [className, cls[view]].filter((item): item is string => Boolean(item)),
      )}
    >
      <div className={cls.list}>
        {articles.map(renderArticle)}
        {isLoading && getSkeletons(view)}
      </div>
      {!isLoading && articles.length === 0 && <Text text={t("Статей нет")} />}
    </div>
  );
});

ArticleList.displayName = "ArticleList";
