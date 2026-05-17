import { useEffect } from "react";

const useScrollToBottom = (
  ref: React.RefObject<HTMLDivElement | null>,
  dependency: unknown
) => {
  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [dependency, ref]);
};

export default useScrollToBottom;