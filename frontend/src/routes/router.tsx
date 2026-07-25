import { createBrowserRouter } from "react-router-dom";
import { PlatformShell } from "../components/layout/PlatformShell";
// import { Footer } from "../components/layout/Footer"; — removed for now
// import { Header } from "../components/layout/Header"; — removed for now
// import { About } from "../pages/About";
// import { Board } from "../pages/Board";
// import { Home } from "../pages/Home"; — the cinematic scrubber intro, unmounted while the platform shell is being built
// import { IdeaDetail } from "../pages/IdeaDetail";
import { Login } from "../pages/Login";
// import { NewIdea } from "../pages/NewIdea";
import { Overview } from "../pages/Overview";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PlatformShell>
        <Overview />
      </PlatformShell>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  // Other routes (about, board, idea detail/new) are unwired for now —
  // their sidebar entries render as disabled "soon" items. Pages still
  // exist on disk. See PLATFORM-SECTIONS.md.
]);
