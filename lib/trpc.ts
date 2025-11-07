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
        try {
          const res = await fetch(url, {
            ...options,
            signal: options?.signal,
          });
          
          if (!res.ok && res.status === 404) {
            console.log('[tRPC] ⚠️ Backend not available (404) - falling back to mock data');
          }
          
          return res;
        } catch (err) {
          console.log('[tRPC] ⚠️ Backend connection failed - using mock data');
          throw err;
        }
      },
    }),
  ],
});
