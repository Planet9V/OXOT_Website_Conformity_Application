import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAdminSession, getGetAdminSessionQueryKey } from "@workspace/api-client-react";

/**
 * Redirect to the login page unless an ADMIN session is active. The public
 * "demo" role authenticates but must never reach the site-admin surfaces, so a
 * demo session is treated exactly like an anonymous one here. (Missing role ==
 * a legacy admin token, which stays admin — only an explicit "demo" is blocked.)
 */
export function useAdminGuard(): { authenticated: boolean; isLoading: boolean } {
  const [, setLocation] = useLocation();
  const { data: session, isLoading, error } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  const isAdmin = Boolean(session?.authenticated) && session?.role !== "demo";

  useEffect(() => {
    if (!isLoading && (!isAdmin || error)) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAdmin, error, setLocation]);

  return { authenticated: isAdmin, isLoading };
}
