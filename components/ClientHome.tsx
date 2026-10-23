"use client";

import React, { useState, useEffect } from 'react';
import EmailSeeder from "@/components/EmailSeeder";
import { LandingPage } from "@/components/LandingPage";
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, User, GoogleAuthProvider } from 'firebase/auth';
import { toast } from '@/components/Toast';
import { BrandLogo } from '@/components/BrandLogo';

const AUTH_COOKIE_NAME = 'iEmail_auth';

function setAuthCookie(active: boolean) {
  if (typeof document === 'undefined') return;
  if (active) {
    document.cookie = `${AUTH_COOKIE_NAME}=true; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

interface ClientHomeProps {
  initialHasAuth?: boolean;
}

export default function ClientHome({ initialHasAuth = false }: ClientHomeProps) {
  const [user, setUser] = useState<User | null>(null);

  // Synchronously initialize isRestoringSession to true if the server saw the auth cookie
  // OR if the browser localStorage has existing session credentials.
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(() => {
    if (initialHasAuth) return true;
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('firebase:authUser:') || key === 'iEmail_senderEmail')) {
            return true;
          }
        }
      } catch {
        return false;
      }
    }
    return false;
  });

  const [initialAccounts, setInitialAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Safety timeout: stop restoring spinner after 3.5 seconds
    const timer = setTimeout(() => setIsRestoringSession(false), 3500);

    // Initialize Device ID immediately on mount
    let deviceId = localStorage.getItem('iEmail_deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('iEmail_deviceId', deviceId);
    }

    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      clearTimeout(timer);
      if (authenticatedUser) {
        setAuthCookie(true);
        setUser(authenticatedUser);

        // Pre-fetch accounts for EmailSeeder
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          const url = new URL(`${baseUrl}/auth/accounts`);
          const currentDeviceId = localStorage.getItem('iEmail_deviceId');
          if (currentDeviceId) {
            url.searchParams.append('deviceId', currentDeviceId);
          }
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            setInitialAccounts(data.accounts || []);
          } else {
            // If backend doesn't recognize the user or error occurs, don't auto-login
            setAuthCookie(false);
            setUser(null);
          }
        } catch (e) {
          console.error("Gateway account fetch error:", e);
          setAuthCookie(false);
          setUser(null);
        }
      } else {
        setAuthCookie(false);
        setUser(null);
        setInitialAccounts([]);
      }
      setIsRestoringSession(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (loggedUser.email && accessToken) {
        setAuthCookie(true);

        // Sync with backend immediately
        const deviceId = localStorage.getItem('iEmail_deviceId');
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const syncResponse = await fetch(`${baseUrl}/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loggedUser.email,
            name: loggedUser.displayName,
            picture: loggedUser.photoURL,
            deviceId,
            token_json: JSON.stringify({
              token: accessToken,
              refresh_token: null,
              expiry_date: Date.now() + 3600 * 1000,
            }),
          }),
        });

        if (syncResponse.ok) {
          // Re-fetch accounts to ensure the new one is included with deviceId association
          const accountsUrl = new URL(`${baseUrl}/auth/accounts`);
          if (deviceId) accountsUrl.searchParams.append('deviceId', deviceId);
          const res = await fetch(accountsUrl.toString());
          if (res.ok) {
            const data = await res.json();
            setInitialAccounts(data.accounts || []);
          }
          toast.success(`Welcome, ${loggedUser.displayName || loggedUser.email}!`, {
            title: 'Signed in successfully',
          });
        } else {
          let errorMsg = 'Could not sign in with backend. Please check connection.';
          try {
            const errorData = await syncResponse.json();
            if (errorData.message) errorMsg = `Sign-in issue: ${errorData.message}`;
          } catch (e) {
            errorMsg = 'Could not connect to the service. Please try again.';
          }
          handleLogout();
          toast.error(errorMsg, { title: 'Authentication Issue' });
          throw new Error(errorMsg);
        }
      }
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      console.error('Login failed:', error);
      toast.error(error?.message || 'Could not complete sign in with Google.', {
        title: 'Sign In Failed',
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      setAuthCookie(false);
      await auth.signOut();
      setUser(null);
      setInitialAccounts([]);
      // Force clean state
      localStorage.removeItem('iEmail_senderEmail');
      localStorage.removeItem('iEmail_senderName');
      localStorage.removeItem('iEmail_senderPicture');
      toast.info('You have been signed out successfully.', {
        title: 'Signed Out',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Could not complete logout properly.');
    }
  };

  // Prevent flash: if session is restoring, show clean branded workspace loader
  if (isRestoringSession && !user) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
            <BrandLogo size={36} />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8B949E]">
            <div className="w-3.5 h-3.5 border-2 border-[#58A6FF] border-t-transparent rounded-full animate-spin" />
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // Strictly render EmailSeeder ONLY if authenticated
  if (user) {
    return (
      <main className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
        <EmailSeeder
          onLogout={handleLogout}
          initialAccounts={initialAccounts}
          currentUserEmail={user.email}
        />
      </main>
    );
  }

  // Default fallback for first-time visitors and guests: Landing Page
  return <LandingPage onLaunch={handleLogin} onLogin={handleLogin} />;
}
