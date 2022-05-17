import { useTransition } from "@remix-run/react";
import nProgress from "nprogress";
import { useEffect } from "react";

export function useNProgress() {
  let transition = useTransition();
  useEffect(() => {
    if (transition.state === "idle") nProgress.done();
    else nProgress.start();
  }, [transition.state]);
}
