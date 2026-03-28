import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  console.log('[tRPC] 🔧 Checking environment variables...');
  console.log('[tRPC] 🌐 EXPO_PUBLIC_RORK_API_BASE_URL =', url);
  console.log('[tRPC] 🌐 All EXPO_PUBLIC vars:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC')));
  
  if (url) {
    console.log('[tRPC] ✅ Base URL found:', url);
    console.log('[tRPC] 🌐 Full tRPC URL will be:', `${url}/api/trpc`);
    return url;
  }

  console.error('[tRPC] ❌ EXPO_PUBLIC_RORK_API_BASE_URL not set');
  console.error('[tRPC] ❌ Please restart Expo with: bun start --clear');
  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL and restart Expo"
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
        console.log('[tRPC] 🔗 Request method:', options?.method);
        console.log('[tRPC] 🔗 Request headers:', options?.headers);
        
        try {
          const res = await fetch(url, {
            ...options,
            signal: options?.signal,
          });
          
          console.log('[tRPC] 📊 Response status:', res.status);
          console.log('[tRPC] 📊 Response content-type:', res.headers.get('content-type'));
          
          const clonedRes = res.clone();
          const text = await clonedRes.text();
          console.log('[tRPC] 📊 Response body (first 500 chars):', text.substring(0, 500));
          
          if (!res.ok) {
            console.log('[tRPC] ⚠️ Response not OK:', res.status, res.statusText);
            if (res.status === 404) {
              console.log('[tRPC] ⚠️ Backend not available (404)');
            }
          }
          
          return res;
        } catch (err) {
          console.error('[tRPC] ❌ Backend connection failed:', err);
          if (err instanceof Error) {
            console.error('[tRPC] ❌ Error message:', err.message);
            console.error('[tRPC] ❌ Error stack:', err.stack);
          }
          throw err;
        }
      },
    }),
  ],
});
