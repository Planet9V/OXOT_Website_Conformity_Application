import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * The Settings page has been consolidated into the new Integrations console.
 * Redirect any lingering links/bookmarks there.
 */
export default function AdminSettings() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/admin/integrations");
  }, [setLocation]);
  return null;
}
