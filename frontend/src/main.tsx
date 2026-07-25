import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { IntroGate } from "./components/layout/IntroGate";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import { router } from "./routes/router";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <IntroGate>
          <RouterProvider router={router} />
        </IntroGate>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
