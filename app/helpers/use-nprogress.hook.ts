import nProgress from "nprogress";
import { useEffect } from "react";
import { useGlobalPendingState } from "remix-utils";

export function useNProgress() {
  let state = useGlobalPendingState();
  useEffect(() => {
    if (state === "pending") nProgress.start();
    if (state === "idle") nProgress.done();
  }, [state]);
}
