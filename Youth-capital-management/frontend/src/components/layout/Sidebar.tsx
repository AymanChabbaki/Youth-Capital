import { Link, useLocation } from "react-router-dom";
import { useLang } from "../../i18n/LanguageContext";
import {
  BellIcon,
  BoardIcon,
  BuildingIcon,
  GridIcon,
  InboxIcon,
  LogInIcon,
  PlusCircleIcon,
  ScaleIcon,
  SettingsIcon,
} from "../icons";

// Member-tier sections only — a guest previews what opens up after sign-in.
// Coordinator/national-lead/leadership review sections are role-gated and
// stay out of the guest sidebar entirely (see PLATFORM-SECTIONS.md §4).
// Icon-only rail: no visible label, so each item still needs a real
// aria-label/title for screen readers and hover discoverability.
const ITEMS = [
  { key: "overview", to: "/", Icon: GridIcon },
  { key: "board", to: null, Icon: BoardIcon },
  { key: "newIdea", to: null, Icon: PlusCircleIcon },
  { key: "myRequests", to: null, Icon: InboxIcon },
  { key: "directory", to: null, Icon: BuildingIcon },
  { key: "notifications", to: null, Icon: BellIcon },
  { key: "settings", to: null, Icon: SettingsIcon },
] as const;

export function Sidebar() {
  const { tr } = useLang();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-mark" title={tr.brand.name} aria-label={tr.brand.name}>
        <ScaleIcon size={20} />
      </Link>

      <nav className="sidebar-nav">
        {ITEMS.map(({ key, to, Icon }) => {
          const label = tr.sidebar.nav[key];
          return to ? (
            <Link
              key={key}
              to={to}
              className={`sidebar-item${pathname === to ? " active" : ""}`}
              title={label}
              aria-label={label}
            >
              <Icon size={19} />
            </Link>
          ) : (
            <div
              key={key}
              className="sidebar-item disabled"
              title={`${label} — ${tr.sidebar.soon}`}
              aria-label={label}
              aria-disabled="true"
            >
              <Icon size={19} />
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <Link to="/login" className="sidebar-item" title={tr.sidebar.signIn} aria-label={tr.sidebar.signIn}>
          <LogInIcon size={19} />
        </Link>
      </div>
    </aside>
  );
}
