'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api-client';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export function BlockChecker() {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkBlockedStatus = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const { user } = await authApi.me(token);
        if (user?.isBlocked) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      } catch (err) {
        // If api fails (e.g. invalid token), ignore here.
        // It might be handled by global auth boundaries if token expires.
      }
    };

    checkBlockedStatus();

    const interval = setInterval(checkBlockedStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md shadow-2xl border border-red-200">
        <svg className="w-20 h-20 mx-auto mb-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10a9 9 0 110 18 9 9 0 010-18z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg text-red-700">You are blocked. Not able to watch anything.</p>
        <button 
          onClick={() => {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/login';
          }}
          className="mt-8 px-8 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
