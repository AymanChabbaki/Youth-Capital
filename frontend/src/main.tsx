import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL for independent hosting (e.g., on Vercel)
// The generated API client already includes the '/api' prefix in its paths.
setBaseUrl(import.meta.env.VITE_API_URL || "");

createRoot(document.getElementById("root")!).render(<App />);
