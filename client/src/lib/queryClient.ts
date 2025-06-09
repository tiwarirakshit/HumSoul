import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

interface QueryOptions {
  on401: UnauthorizedBehavior;
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

export const getQueryFn: <T>(options: QueryOptions) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, method = "GET", data, headers = {} }) =>
  async ({ queryKey }) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    const requestHeaders: Record<string, string> = {
      ...headers,
      ...(data ? { "Content-Type": "application/json" } : {}),
    };

    const res = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
