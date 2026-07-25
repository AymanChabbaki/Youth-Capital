import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="platform-shell">
      <Sidebar />
      <div className="platform-main">
        <Topbar />
        <div className="platform-content">{children}</div>
      </div>
    </div>
  );
}
