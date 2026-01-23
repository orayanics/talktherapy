import { useState, useRef, useEffect } from "react";

export const useScrollToBottom = () => {
  const [isBottom, setIsBottom] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElement = bottomRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        setIsBottom(true);
      } else {
        setIsBottom(false);
      }
    };

    contentElement.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      contentElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { isBottom, bottomRef };
};
