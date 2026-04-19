/** @format */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{ success: { duration: 3000 }, error: { duration: 4000 } }}
      />
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
