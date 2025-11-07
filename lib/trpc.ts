import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    console.log('[tRPC] 🌐 Base URL:', url);
    console.log('[tRPC] 🌐 Full tRPC URL will be:', `${url}/api/trpc`);
    return url;
  }

  console.error('[tRPC] ❌ EXPO_PUBLIC_RORK_API_BASE_URL not set');
  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          'content-type': 'application/json',
        };
      },
      fetch: async (url, options) => {
        console.log('[tRPC] 🔗 Attempting to fetch:', url);
        try {
          const res = await fetch(url, {
            ...options,
            signal: options?.signal,
          });
          
          console.log('[tRPC] 📊 Response status:', res.status);
          
          if (!res.ok) {
            console.log('[tRPC] ⚠️ Response not OK:', res.status, res.statusText);
            if (res.status === 404) {
              console.log('[tRPC] ⚠️ Backend not available (404) - falling back to mock data');
            }
          } else {
            console.log('[tRPC] ✅ Successful response from backend');
          }
          
          return res;
        } catch (err) {
          console.error('[tRPC] ❌ Backend connection failed:', err);
          console.log('[tRPC] ⚠️ Using mock data fallback');
          throw err;
        }
      },
    }),
  ],
});
