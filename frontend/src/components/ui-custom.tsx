import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps, useInView, useMotionValue, useScroll, useSpring, useTransform, animate } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-19.32-72.1M42.56,65.36c-5.36,0-9.8-4.93-9.8-11s4.38-11,9.8-11,9.85,4.92,9.8,11-4.43,11-9.8,11m42,0c-5.36,0-9.8-4.93-9.8-11s4.38-11,9.8-11,9.85,4.92,9.8,11-4.43,11-9.8,11" />
  </svg>
);

// --- BUTTON ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      gold: "btn-shimmer bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent/90 hover:shadow-lg hover:-translate-y-0.5",
      outline: "border-2 border-primary text-primary hover:bg-primary/5",
      ghost: "hover:bg-primary/10 text-foreground",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ms-1 me-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- INPUT ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "ps-10",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// --- TEXTAREA ---
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// --- CARD ---
export function Card({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn("bg-card text-card-foreground rounded-2xl border border-border/50 shadow-lg shadow-black/5 overflow-hidden", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- BADGE ---
export function Badge({ className, variant = "default", children }: { className?: string, variant?: "default" | "gold" | "destructive" | "outline", children: React.ReactNode }) {
  const variants = {
    default: "bg-primary/10 text-primary",
    gold: "bg-accent/20 text-accent-foreground border border-accent/30",
    destructive: "bg-destructive/10 text-destructive",
    outline: "border border-border text-foreground",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

// --- LABEL ---
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block", className)} {...props} />
  )
);
Label.displayName = "Label";

// --- SELECT ---
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
// --- PROGRESS ---
export function Progress({ value = 0, className }: { value?: number, className?: string }) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}>
      <motion.div
        className="h-full w-full flex-1 bg-primary transition-all"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

// --- COUNT UP ---
// Animated number that counts from 0 when scrolled into view.
// Accepts raw numbers or formatted strings like "1.2k", "94%", "450+".
export function CountUp({ value, className, duration = 1.6 }: { value: string | number; className?: string; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const str = String(value);
  const match = str.match(/^([\d.,]+)(.*)$/);
  const target = match ? parseFloat(match[1].replace(/,/g, "")) : NaN;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;

  React.useEffect(() => {
    if (!inView || !ref.current || isNaN(target)) return;
    const el = ref.current;
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, target, suffix, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {isNaN(target) ? str : `0${suffix}`}
    </span>
  );
}

// --- TILT CARD ---
// 3D perspective tilt that follows the cursor, with a gold spotlight glow.
export function TiltCard({ className, children, maxTilt = 8 }: { className?: string; children: React.ReactNode; maxTilt?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), { stiffness: 250, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
    ref.current?.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    ref.current?.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn("card-spotlight will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

// --- REVEAL ---
// Scroll-triggered entrance wrapper with directional slide.
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  once?: boolean;
}) {
  const offsets = {
    up: { y: 32, x: 0 },
    down: { y: -32, x: 0 },
    left: { x: 32, y: 0 },
    right: { x: -32, y: 0 },
    none: { x: 0, y: 0 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- SKELETON ---
// Shimmering placeholder block. Compose into content-shaped loading layouts.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-foreground/[0.07]", className)} aria-hidden />;
}

// Skeleton page shell matching the PageHero + overlapping panel layout.
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="w-full flex flex-col bg-background" aria-busy="true" aria-label="Loading">
      <div className="bg-navy-dark pt-24 pb-32 md:pt-32 md:pb-40 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-4 w-44 bg-white/10" />
          <Skeleton className="h-14 md:h-20 w-3/4 max-w-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
          <div className="flex gap-8 pt-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-28 bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full px-4 -mt-16 relative z-20 pb-24">
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 space-y-10">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <Skeleton className="hidden md:block w-12 h-10 shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>
              <Skeleton className="w-16 h-16 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SECTION BACKDROP ---
// Interactive background layer for sections: scroll-parallax orbs, a gold
// spotlight that follows the cursor, slow-rotating geometric shapes, and an
// optional giant outlined ghost word. Drop inside any `relative overflow-hidden`
// section as the first child.
export function SectionBackdrop({
  ghost,
  grid = true,
  spotlight = true,
  orbs = true,
  shapes = false,
  flip = false,
}: {
  ghost?: string;
  grid?: boolean;
  spotlight?: boolean;
  orbs?: boolean;
  shapes?: boolean;
  flip?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yOrb1 = useTransform(scrollYProgress, [0, 1], [-70, 70]);
  const yOrb2 = useTransform(scrollYProgress, [0, 1], [50, -90]);
  const yGhost = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rotateA = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const rotateB = useTransform(scrollYProgress, [0, 1], [45, -30]);

  // The backdrop is pointer-events-none, so track the cursor on the parent section
  React.useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      ref.current?.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      ref.current?.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    };
    parent.addEventListener("mousemove", onMove);
    return () => parent.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden>
      {grid && <div className="absolute inset-0 bg-grid-gold opacity-30" />}

      {spotlight && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(650px circle at var(--spot-x, 70%) var(--spot-y, 30%), hsl(44 55% 54% / 0.08), transparent 60%)",
          }}
        />
      )}

      {orbs && (
        <>
          <motion.div
            style={{ y: yOrb1 }}
            className={`absolute w-[26rem] h-[26rem] bg-gold/10 blur-[110px] rounded-full ${flip ? "-bottom-32 -right-32" : "-top-32 -left-32"}`}
          />
          <motion.div
            style={{ y: yOrb2 }}
            className={`absolute w-[24rem] h-[24rem] bg-primary/15 blur-[110px] rounded-full ${flip ? "-top-32 -left-32" : "-bottom-32 -right-32"}`}
          />
        </>
      )}

      {shapes && (
        <>
          <motion.div style={{ rotate: rotateA }} className="absolute top-[12%] right-[6%] w-24 h-24 md:w-32 md:h-32 border border-gold/20 rounded-[2rem]" />
          <motion.div style={{ rotate: rotateB }} className="absolute bottom-[14%] left-[5%] w-16 h-16 md:w-24 md:h-24 border border-primary/20 rounded-full border-dashed" />
          <motion.span
            animate={{ y: [0, -22, 0], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[12%] w-2 h-2 rounded-full bg-gold/60"
          />
          <motion.span
            animate={{ y: [0, 18, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[28%] right-[16%] w-3 h-3 rounded-full bg-gold/40"
          />
        </>
      )}

      {ghost && (
        <motion.span
          style={{ y: yGhost, WebkitTextStroke: "1.5px hsl(44 55% 54% / 0.14)" }}
          className={`absolute top-1/2 -translate-y-1/2 font-display font-black uppercase whitespace-nowrap leading-none text-transparent text-[22vw] md:text-[16vw] tracking-tight ${flip ? "-left-[2vw]" : "-right-[2vw]"}`}
        >
          {ghost}
        </motion.span>
      )}
    </div>
  );
}

// --- PAGE HERO ---
// Signature dark-navy hero band for every page: oversized editorial type,
// gold eyebrow rule, dotted grid, ambient glows, and floating particles.
export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  children,
  compact = false,
  className,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative px-4 overflow-hidden bg-navy-dark",
        compact ? "pt-20 pb-24 md:pt-28 md:pb-32" : "pt-24 pb-32 md:pt-36 md:pb-44",
        className
      )}
    >
      {/* Texture + ambient glows */}
      <div className="absolute inset-0 bg-grid-gold opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[560px] h-[560px] bg-primary/25 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-52 -left-32 w-[480px] h-[480px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "22%", left: "8%", size: 5, delay: 0 },
          { top: "68%", left: "16%", size: 3, delay: 1.4 },
          { top: "30%", left: "88%", size: 6, delay: 0.7 },
          { top: "74%", left: "80%", size: 4, delay: 2.1 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold/50 blur-[1px]"
            style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
            animate={{ y: [0, -26, 0], opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: 7 + i, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 mb-6 md:mb-8"
        >
          <span className="w-10 md:w-14 h-px bg-gold/60" />
          <span className="text-gold font-bold uppercase tracking-[0.25em] text-[11px] md:text-sm">{eyebrow}</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
          className={cn(
            "font-display font-black text-white leading-[1.05] tracking-tight text-balance max-w-5xl",
            compact ? "text-4xl md:text-6xl mb-6" : "text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-8"
          )}
        >
          {title.split(" ").map((word, i) => (
            <motion.span
              key={`t-${i}`}
              variants={{
                hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="inline-block"
            >
              {word}&nbsp;
            </motion.span>
          ))}
          {highlight &&
            highlight.split(" ").map((word, i) => (
              <motion.span
                key={`hl-${i}`}
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="inline-block text-gradient-gold"
              >
                {word}&nbsp;
              </motion.span>
            ))}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/60 text-base md:text-xl max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="mt-10 md:mt-14"
          >
            {children}
          </motion.div>
        )}
      </div>

      {/* Fade into page background */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

// --- HERO STAT ---
// Big editorial stat for use inside PageHero children rows.
export function HeroStat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-white/40 text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em]">{label}</p>
      <p className={cn("text-3xl sm:text-4xl font-display font-black", accent ? "text-gradient-gold" : "text-white")}>
        <CountUp value={value} />
      </p>
    </div>
  );
}

// --- SECTION HEADING ---
// Consistent eyebrow badge + display title for section headers.
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  const alignCls = align === "center" ? "text-center items-center" : "text-center lg:text-start items-center lg:items-start";
  return (
    <div className={cn("flex flex-col mb-12 md:mb-16", alignCls, className)}>
      {eyebrow && (
        <Reveal direction="up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal direction="up" delay={0.08}>
        <h2 className="text-3xl md:text-5xl font-display font-black text-foreground leading-tight text-balance">
          {title}
          {highlight && <span className="text-gradient-gold"> {highlight}</span>}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal direction="up" delay={0.16}>
          <p className={cn("text-muted-foreground text-base md:text-lg max-w-2xl mt-4", align === "center" ? "mx-auto" : "")}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
