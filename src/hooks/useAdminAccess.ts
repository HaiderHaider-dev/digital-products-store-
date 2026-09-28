import { useState, useEffect } from 'react';

/**
 * Owner/Admin access bypass.
 * 
 * To activate: add ?admin=haiderali to the URL
 * Example: https://yoursite.com?admin=haiderali
 * 
 * Once activated, it persists in localStorage so you don't need
 * the URL param every time. To deactivate, clear localStorage or
 * add ?admin=logout to the URL.
 */

const ADMIN_KEY = 'v_store_admin';
const ADMIN_SECRET = 'haiderali';

export function useAdminAccess(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');

    if (adminParam === ADMIN_SECRET) {
      localStorage.setItem(ADMIN_KEY, 'true');
      setIsAdmin(true);
      // Clean URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
    } else if (adminParam === 'logout') {
      localStorage.removeItem(ADMIN_KEY);
      setIsAdmin(false);
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return isAdmin;
}
