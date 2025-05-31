import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Main application entry point
 * The App component now internally manages all the necessary providers:
 * 1. ThemeProvider - For dark/light mode theming
 * 2. AudioProvider - For audio playback functionality
 * 3. QueryClientProvider - For data fetching with react-query
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

// Render the app directly since providers are now in App.tsx
root.render(<App />);
