import { ReactNode, useEffect, useState } from "react";
import { Spinner } from "../Spinner";

const SEEN_KEY = "iya-intro-seen";
const LOADER_MS = 900;

/**
 * App entry loader — matches the live IYA site's pattern exactly: a plain
 * centered spinner while the app readies itself, then it's gone. Shown once
 * per browser session.
 */
export function IntroGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">(() =>
    sessionStorage.getItem(SEEN_KEY) ? "done" : "loading"
  );

  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setPhase("fading");
    }, LOADER_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const t = window.setTimeout(() => setPhase("done"), 400); // matches CSS fade
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <>
      {children}
      {phase !== "done" && (
        <div className={`intro-loader${phase === "fading" ? " fading" : ""}`}>
          <Spinner size={48} />
        </div>
      )}
    </>
  );
}
