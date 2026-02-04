import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { PostHogProvider } from "posthog-js/react";
import type { PostHogConfig } from "posthog-js";

import "./globals.css";

const options: Partial<PostHogConfig> = {
  api_host: "/translate",
  ui_host: "https://us.posthog.com",
  defaults: "2025-11-30",
} as const;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      options={options}
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    >
      <App />
    </PostHogProvider>
  </StrictMode>,
);
