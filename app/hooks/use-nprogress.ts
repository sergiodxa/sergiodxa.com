import nProgress from "nprogress";
import { useEffect } from "react";
import { useTransition } from "remix";

export function useNProgress() {
  let transition = useTransition();
  useEffect(() => {
    if (transition.state === "idle") nProgress.done();
    else nProgress.start();
  }, [transition.state]);
}
