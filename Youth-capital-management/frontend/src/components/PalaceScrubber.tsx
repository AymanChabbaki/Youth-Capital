import { useEffect, useRef, useState } from "react";
import walkthroughVideo from "../assets/images/palace-entrance.mp4";
import posterImg from "../assets/images/Gemini_Generated_Image_xp1dajxp1dajxp1d.png";
import { useLang } from "../i18n/LanguageContext";

const STAGE_COUNT = 4;
const VH_PER_STAGE = 115; // scroll distance dedicated to each stage
const DRIVER_HEIGHT_VH = STAGE_COUNT * VH_PER_STAGE;

/**
 * Cinematic entrance: scroll pins this section to the viewport (position:
 * sticky, not fixed) while it scrubs a walkthrough video by scroll progress
 * local to this section only. Once its scroll budget is spent, it un-pins
 * naturally and the rest of the Home page continues below — no scroll
 * hijacking, no separate route, every pixel of scroll does something.
 */
export function PalaceScrubber() {
  const { tr, fmt } = useLang();
  const driverRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    // iOS Safari only allows scripted currentTime scrubbing after the video
    // has been "activated" once. Request play and pause it back immediately
    // (synchronously, not inside the play() promise) — waiting for the
    // promise to resolve before pausing left the video actually playing on
    // some browsers, fighting the scroll-driven currentTime writes below.
    const video = videoRef.current;
    if (!video) return;
    const playAttempt = video.play();
    video.pause();
    playAttempt?.catch(() => {});
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    let ticking = false;

    function update() {
      ticking = false;
      const el = driverRef.current;
      const video = videoRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const p = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
      setProgress(p);

      if (video && video.duration) {
        if (!video.paused) video.pause();
        video.currentTime = p * video.duration;
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const stages = tr.home.scrubber.stages;
  const activeIdx = Math.min(stages.length - 1, Math.floor(progress * stages.length));

  if (reduced) {
    return (
      <section className="scrubber-static">
        <img src={posterImg} alt="" className="scrubber-static-img" />
        <div className="scrubber-static-scrim" />
        <div className="scrubber-static-content">
          <span className="kicker">{tr.home.scrubber.eyebrow}</span>
          <h1>{stages[0].title}</h1>
          <p className="lead" style={{ color: "hsl(0 0% 92%)" }}>
            {stages[stages.length - 1].text}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={driverRef} className="scrubber-driver" style={{ height: `${DRIVER_HEIGHT_VH}vh` }}>
      <div className="scrubber-stage">
        <video ref={videoRef} className="scrubber-video" muted playsInline preload="auto" poster={posterImg}>
          <source src={walkthroughVideo} type="video/mp4" />
        </video>
        <div className="scrubber-scrim" />

        <div className="scrubber-topline">
          <span>{tr.home.scrubber.eyebrow}</span>
          <span className="scrubber-pct">{fmt(Math.round(progress * 100))}%</span>
        </div>

        <div className="scrubber-rail">
          <div className="scrubber-rail-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="scrubber-hud">
          {stages.map((s, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            return (
              <div className={`scrubber-text${i === activeIdx ? " active" : ""}`} key={s.title}>
                <span className="scrubber-num">{fmt(i + 1).padStart(2, "0")}</span>
                <Heading>{s.title}</Heading>
                <p>{s.text}</p>
              </div>
            );
          })}
        </div>

        <div className="scrubber-dots">
          {stages.map((s, i) => (
            <span key={s.title} className={`scrubber-dot${i === activeIdx ? " active" : ""}`} />
          ))}
        </div>

        <div className="scrubber-hint" style={{ opacity: progress > 0.025 ? 0 : 1 }}>
          {tr.home.scrubber.hint}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m0 0-5-5m5 5 5-5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
