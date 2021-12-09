/* eslint-disable jsx-a11y/heading-has-content */
import { useId } from "@react-aria/utils";
import { createContext, HTMLAttributes, useContext } from "react";

const HeadingLevelContext = createContext<number>(0);
const HeadingIdContext = createContext<string | undefined>(void 0);

export function useHeadingID() {
  return useContext(HeadingIdContext);
}

export function Region({ id, ...props }: HTMLAttributes<HTMLDivElement>) {
  const internalId = useId(id); // We use the received ID to overwrite it
  const headingLevel = useContext(HeadingLevelContext);
  const nextLevel = headingLevel + 1;
  return (
    <HeadingIdContext.Provider value={internalId}>
      <HeadingLevelContext.Provider value={nextLevel}>
        <section {...props} aria-labelledby={internalId} />
      </HeadingLevelContext.Provider>
    </HeadingIdContext.Provider>
  );
}

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: number | "auto";
};

export function Heading({ level = "auto", ...props }: HeadingProps) {
  const id = useHeadingID();
  const headingLevel = useContext(HeadingLevelContext);

  if (id !== undefined && props.id !== undefined && id !== props.id) {
    // We need to ensure if we pass an ID to the Heading we must pass the same
    // ID to the parent Region. If we don't do this the ID and labelledby will
    // not match
    throw new Error(
      "When wrapping a Heading in a Region, ensure you provide the same `id` to both components."
    );
  }

  if (level === "auto" && headingLevel === 0) {
    throw new Error(
      "To use auto heading levels wrap your Heading in a Region."
    );
  }

  if (typeof level === "number" && level <= 0) {
    throw new Error(
      "The level of a Heading must be a positive value greater than zero."
    );
  }

  const actualLevel = level === "auto" ? headingLevel : level;

  switch (actualLevel) {
    case 1: {
      return <h1 {...props} id={id ?? props.id} />;
    }
    case 2: {
      return <h2 {...props} id={id ?? props.id} />;
    }
    case 3: {
      return <h3 {...props} id={id ?? props.id} />;
    }
    case 4: {
      return <h4 {...props} id={id ?? props.id} />;
    }
    case 5: {
      return <h5 {...props} id={id ?? props.id} />;
    }
    case 6: {
      return <h6 {...props} id={id ?? props.id} />;
    }
    default: {
      return (
        <div
          {...props}
          id={id ?? props.id}
          role="heading"
          aria-level={actualLevel}
        />
      );
    }
  }
}
