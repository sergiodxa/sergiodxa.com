import clsx, { ClassValue } from "clsx";
import {
  AriaAttributes,
  HTMLAttributes,
  Key,
  KeyboardEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

export type FeedShortcuts = {
  first?: string;
  next?: string;
  prev?: string;
  last?: string;
};

type FeedArticleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "tabIndex" | "role" | "aria-posinset" | "aria-setsize"
>;

export type FeedListProps<Item = unknown> = AriaAttributes &
  IntersectionObserverInit & {
    className?: ClassValue;
    heading?: ReactNode;
    data: Item[];
    renderItem(item: Item, index: number): ReactNode;
    isLoadingMore?: boolean;
    onReachingEnd?(): void;
    shortcuts?: FeedShortcuts;
    keyExtractor?(item: Item, index: number): Key;
    articleProps?:
      | FeedArticleProps
      | ((item: Item, index: number) => FeedArticleProps);
  };

let DEFAULT_SHORTCUTS: FeedShortcuts = {
  first: "Home",
  next: "ArrowDown",
  prev: "ArrowUp",
  last: "End",
};

let DEFAULT_WRAPPER_PROPS: FeedListProps["articleProps"] = {};

function defaultKeyExtractor(item: unknown, index: number): Key {
  if (typeof item !== "object") return index;
  if (Array.isArray(item)) return index;
  if (item === null) return index;
  if (!("key" in item)) return index;
  // @ts-expect-error We did a lot of checks above to ensure item.key exists
  return item.key as Key;
}

function getAncestor(
  element: HTMLElement,
  feedParent: HTMLElement
): HTMLElement {
  if (
    element.matches(`[role="article"]`) &&
    element.parentElement === feedParent
  ) {
    return element;
  }

  let ancestor: HTMLElement | null = null;
  let currentNode = element;

  while (ancestor === null) {
    let parent = currentNode.parentElement;

    if (parent === null) {
      throw new Error("Event target element has no parent element.");
    }

    if (
      parent.matches(`[role="article"]`) &&
      parent.parentElement === feedParent
    ) {
      ancestor = parent;
    } else {
      currentNode = parent;
    }
  }

  return ancestor;
}

export function FeedList<Item = unknown>({
  data,
  root,
  heading,
  shortcuts = DEFAULT_SHORTCUTS,
  threshold,
  className,
  rootMargin,
  renderItem,
  keyExtractor = defaultKeyExtractor,
  articleProps = DEFAULT_WRAPPER_PROPS,
  isLoadingMore = false,
  onReachingEnd,
  ...props
}: FeedListProps<Item>) {
  if (!props["aria-labelledby"] && !props["aria-label"]) {
    throw new Error(
      "A Feed component must have a label. This can be defined using the `aria-labelledby` or `aria-label` props."
    );
  }

  let reachedEnd = useRef(false);
  let end = useRef<HTMLDivElement>(null);

  let onKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
    function onKeyDown(event) {
      let feed = event.currentTarget;
      let articles = feed.querySelectorAll(":scope > article");
      let firstElementChild = articles.item(0);
      let lastElementChild = articles.item(articles.length - 1);
      let { target, key } = event;
      switch (true) {
        case key === shortcuts.first ?? DEFAULT_SHORTCUTS.first: {
          event.preventDefault();
          event.stopPropagation();
          if (!firstElementChild) return;
          let element = getAncestor(target as HTMLElement, feed);
          if (firstElementChild === element) return;
          return (firstElementChild as HTMLElement).focus();
        }
        case key === shortcuts.next ?? DEFAULT_SHORTCUTS.next: {
          event.preventDefault();
          event.stopPropagation();
          let { nextElementSibling } = getAncestor(target as HTMLElement, feed);
          if (!nextElementSibling) return;
          return (nextElementSibling as HTMLElement).focus();
        }
        case key === shortcuts.prev ?? DEFAULT_SHORTCUTS.prev: {
          event.preventDefault();
          event.stopPropagation();
          let { previousElementSibling } = getAncestor(
            target as HTMLElement,
            feed
          );
          if (!previousElementSibling) return;
          return (previousElementSibling as HTMLElement).focus();
        }
        case key === shortcuts.last ?? DEFAULT_SHORTCUTS.last: {
          event.preventDefault();
          event.stopPropagation();
          if (!lastElementChild) return;
          let element = getAncestor(target as HTMLElement, feed);
          if (lastElementChild === element) return;
          reachedEnd.current = false;
          return (lastElementChild as HTMLElement).focus();
        }
        default: {
          return;
        }
      }
    },
    [shortcuts.first, shortcuts.last, shortcuts.next, shortcuts.prev]
  );

  useEffect(
    function checkIfEndIsReached() {
      if (!onReachingEnd) return;
      if (!end.current) return;

      let element = end.current;

      if (typeof window.IntersectionObserver === "undefined") return;

      let observer = new IntersectionObserver(onReachingEnd, {
        root,
        rootMargin,
        threshold,
      });

      observer.observe(element);
      return () => {
        observer.unobserve(element);
      };
    },
    [onReachingEnd, root, rootMargin, threshold]
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      {...props}
      className={clsx(className)}
      onKeyDown={onKeyDown}
      role="feed"
      aria-busy={isLoadingMore}
    >
      {heading}
      {data.map(function mapItemInFeed(item, index) {
        let key = keyExtractor(item, index);
        let child = renderItem(item, index);
        let props =
          typeof articleProps === "function"
            ? articleProps(item, index)
            : articleProps;

        return (
          // We need the tag name and role to be article so the logic work
          // eslint-disable-next-line jsx-a11y/no-redundant-roles
          <article
            {...props}
            role="article"
            key={key}
            // We need this to correctly implement the Feed WAI-ARIA pattern
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            aria-posinset={index + 1}
            aria-setsize={data.length}
          >
            {child}
          </article>
        );
      })}

      {onReachingEnd ? (
        <div ref={end} aria-hidden className="contents" />
      ) : null}
    </div>
  );
}
