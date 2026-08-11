import { SVGProps } from "react";

// Lucide-style stroke icons (24×24, stroke 1.8) — one visual language across
// the product, per the design-system rule: no emojis as structural icons.

function I({ children, size = 22, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement> & { size?: number };

/** The balance / scale — the party's emblem. */
export const ScaleIcon = (p: P) => (
  <I {...p}>
    <path d="M12 3v18M8 21h8" />
    <path d="M5 7h14" />
    <path d="M5 7 2.5 13a3.5 3.5 0 0 0 5 0L5 7zM19 7l-2.5 6a3.5 3.5 0 0 0 5 0L19 7z" />
  </I>
);

export const CpuIcon = (p: P) => (
  <I {...p}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </I>
);

export const MegaphoneIcon = (p: P) => (
  <I {...p}>
    <path d="M3 11v3l14 4V7L3 11z" />
    <path d="M17 7a9 9 0 0 1 0 11" opacity="0.6" />
    <path d="M6.5 14.5 8 20a1 1 0 0 0 1 .8h1.4a1 1 0 0 0 1-1.3L10.5 15" />
  </I>
);

export const GraduationIcon = (p: P) => (
  <I {...p}>
    <path d="m2 9 10-5 10 5-10 5L2 9z" />
    <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
    <path d="M22 9v5" />
  </I>
);

export const HandHeartIcon = (p: P) => (
  <I {...p}>
    <path d="M12 8.5c-1.5-2.7-5.5-2-5.5 1 0 2.2 3 4.3 5.5 6 2.5-1.7 5.5-3.8 5.5-6 0-3-4-3.7-5.5-1z" />
    <path d="M3 21h18" opacity="0.6" />
  </I>
);

export const PaletteIcon = (p: P) => (
  <I {...p}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.5 3.3c.6.7.2 2.7-2.5 2.7z" />
    <circle cx="7.8" cy="10.5" r="0.6" fill="currentColor" />
    <circle cx="12" cy="7.5" r="0.6" fill="currentColor" />
    <circle cx="16.2" cy="10.5" r="0.6" fill="currentColor" />
  </I>
);

export const NetworkIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5" cy="18" r="2.2" />
    <circle cx="19" cy="18" r="2.2" />
    <path d="M10.8 6.8 6.2 16M13.2 6.8l4.6 9.2M7.2 18h9.6" />
  </I>
);

export const LightbulbIcon = (p: P) => (
  <I {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.3 1.5 1.5 2.5h5c.2-1 .7-1.8 1.5-2.5A6 6 0 0 0 12 3z" />
  </I>
);

export const UsersIcon = (p: P) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
    <path d="M16.5 4.6a3.2 3.2 0 0 1 0 6M18 15.2c1.8.6 3 2 3 3.8" opacity="0.65" />
  </I>
);

export const LockIcon = (p: P) => (
  <I {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1" fill="currentColor" />
  </I>
);

export const UnlockIcon = (p: P) => (
  <I {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 7.7-1.5" />
    <circle cx="12" cy="15.5" r="1" fill="currentColor" />
  </I>
);

export const CheckCircleIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3L15.5 9" />
  </I>
);

export const HelpIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.3a2.5 2.5 0 0 1 4.9.7c0 1.6-2.4 2-2.4 3.5" />
    <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
  </I>
);

export const MapIcon = (p: P) => (
  <I {...p}>
    <path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2z" />
    <path d="M9 4v14M15 6v14" opacity="0.6" />
  </I>
);

export const ArrowIcon = (p: P) => (
  <I {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </I>
);

export const SunIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
  </I>
);

export const MoonIcon = (p: P) => (
  <I {...p}>
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
  </I>
);

export const SparkleIcon = (p: P) => (
  <I {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" opacity="0.7" />
  </I>
);

/** Overview / dashboard — four tiles. */
export const GridIcon = (p: P) => (
  <I {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </I>
);

/** Ideas board — a column layout. */
export const BoardIcon = (p: P) => (
  <I {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16M15 4v16" opacity="0.6" />
  </I>
);

export const PlusCircleIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </I>
);

/** Collaboration requests — an inbox tray. */
export const InboxIcon = (p: P) => (
  <I {...p}>
    <path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
    <path d="M5 12 3 6.5A2 2 0 0 1 4.9 4h14.2A2 2 0 0 1 21 6.5L19 12" />
    <path d="M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" opacity="0.6" />
  </I>
);

/** Directory — departments/jihat browser. */
export const BuildingIcon = (p: P) => (
  <I {...p}>
    <rect x="5" y="3" width="9" height="18" rx="1" />
    <rect x="14" y="9" width="5" height="12" rx="1" opacity="0.7" />
    <path d="M8 7h.01M11 7h.01M8 11h.01M11 11h.01M8 15h.01M11 15h.01" />
  </I>
);

export const BellIcon = (p: P) => (
  <I {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </I>
);

export const SettingsIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 13.5a7.97 7.97 0 0 0 0-3l2-1.2-2-3.4-2.3.9a8 8 0 0 0-2.6-1.5L14 2h-4l-.5 2.3a8 8 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.2a7.97 7.97 0 0 0 0 3l-2 1.2 2 3.4 2.3-.9a8 8 0 0 0 2.6 1.5L10 22h4l.5-2.3a8 8 0 0 0 2.6-1.5l2.3.9 2-3.4Z"
      opacity="0.85"
    />
  </I>
);

export const ChevronDownIcon = (p: P) => (
  <I {...p}>
    <path d="m6 9 6 6 6-6" />
  </I>
);

export const SearchIcon = (p: P) => (
  <I {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </I>
);

/** Sign in — a door with an arrow pointing in. */
export const LogInIcon = (p: P) => (
  <I {...p}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M16 16l4-4-4-4" />
    <path d="M20 12H9" />
  </I>
);

/** Sign out — the same door, arrow pointing out. */
export const LogOutIcon = (p: P) => (
  <I {...p}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M15 8l4 4-4 4" />
    <path d="M9 12h10" />
  </I>
);

/** A single account/profile — one person. */
export const UserIcon = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
  </I>
);

/** Money raised — a wallet. */
export const WalletIcon = (p: P) => (
  <I {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v2" />
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M16 13.5h3.5" opacity="0.7" />
    <circle cx="16" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
  </I>
);

/** Money spent — coins changing hands. */
export const CoinsIcon = (p: P) => (
  <I {...p}>
    <circle cx="9" cy="9" r="6" />
    <path d="M14.5 11a6 6 0 1 0-3.5 8.4" opacity="0.7" />
    <circle cx="9" cy="9" r="6" />
  </I>
);

/** A map pin. */
export const PinIcon = (p: P) => (
  <I {...p}>
    <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </I>
);
