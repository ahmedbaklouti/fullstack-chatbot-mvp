import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Small MVP defaults:
      // - retry: makes transient network hiccups less visible to users
      // - staleTime: avoids refetching on every mount during navigation/dev
      // - refetchOnWindowFocus/mount disabled: reduces noise (and duplicate calls) in StrictMode/dev
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      // Never retry mutations automatically to avoid duplicated side effects (duplicate messages).
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
