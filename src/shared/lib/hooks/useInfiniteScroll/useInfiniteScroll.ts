import { MutableRefObject, useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
  callback?: () => void;
  triggerRef: MutableRefObject<HTMLElement>;
  wrapperRef: MutableRefObject<HTMLElement>;
}

export function useInfiniteScroll({
  callback,
  wrapperRef,
  triggerRef,
}: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const triggerElement = triggerRef.current;

    if (!callback || !wrapperElement || !triggerElement) {
      return undefined;
    }

    /**
     * IntersectionObserver сообщает только об ИЗМЕНЕНИИ пересечения.
     * Если контента мало и триггер виден сразу (вид SMALL — карточки
     * раскладываются в сетку и помещаются на экран), изменения не происходит
     * и догрузка не срабатывает. Поэтому состояние проверяем ещё и вручную —
     * при монтировании и при каждом изменении содержимого контейнера.
     *
     * Повторные вызовы безопасны: fetchNextArticlesPage сам проверяет
     * isLoading и hasMore, поэтому лишних запросов не будет.
     */
    const isTriggerVisible = () => {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      const triggerRect = triggerElement.getBoundingClientRect();

      return (
        triggerRect.height > 0 &&
        triggerRect.top >= wrapperRect.top &&
        triggerRect.bottom <= wrapperRect.bottom
      );
    };

    const checkTrigger = () => {
      if (isTriggerVisible()) {
        callback();
      }
    };

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { root: wrapperElement, rootMargin: "0px", threshold: 1.0 },
    );

    observer.current.observe(triggerElement);

    // Проверяем сразу и при любом изменении содержимого: список не
    // обязательно скроллится, но триггер при этом может быть виден.
    const mutationObserver = new MutationObserver(checkTrigger);
    mutationObserver.observe(wrapperElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    checkTrigger();

    return () => {
      observer.current?.unobserve(triggerElement);
      observer.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, [callback, triggerRef, wrapperRef]);
}
