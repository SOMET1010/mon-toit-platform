import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { initPerformanceMonitoring } from '@/lib/analytics';
import App from "./App.tsx";
import "./index.css";

// Initialize performance monitoring in production
if (import.meta.env.PROD) {
  initPerformanceMonitoring();
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
