import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { isAppLockSupported, isAppLockEnabled, enableAppLock, disableAppLock } from '@/lib/appLock';

export function useAppLock() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const supported = isAppLockSupported();

  useEffect(() => {
    setEnabled(user ? isAppLockEnabled(user.id) : false);
  }, [user]);

  const enable = useCallback(async () => {
    if (!user) return { success: false, error: 'Sign in required' };
    const res = await enableAppLock(user.id, user.email || 'Continua user');
    if (res.success) setEnabled(true);
    return res;
  }, [user]);

  const disable = useCallback(() => {
    if (!user) return;
    disableAppLock(user.id);
    setEnabled(false);
  }, [user]);

  return { enabled, supported, enable, disable };
}