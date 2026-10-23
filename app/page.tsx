"use client";

import React, { useState } from 'react';
import EmailSeeder from "@/components/EmailSeeder";
import { LandingPage } from "@/components/LandingPage";
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, User, GoogleAuthProvider } from 'firebase/auth';
import { toast } from '@/components/Toast';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialAccounts, setInitialAccounts] = useState<any[]>([]);

  React.useEffect(() => {
    // Safety timeout: stop loading spinner after 5 seconds even if Firebase is sluggish
    const timer = setTimeout(() => setIsLoading(false), 5000);

    // Initialize Device ID immediately on mount
    let deviceId = localStorage.getItem('iEmail_deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('iEmail_deviceId', deviceId);
    }

    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      clearTimeout(timer);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        // Pre-fetch accounts for EmailSeeder, but don't block the UI mount
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
            setUser(null);
          }
        } catch (e) {
          console.error("Gateway account fetch error:", e);
          setUser(null);
        }
      } else {
        setUser(null);
        setInitialAccounts([]);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (user.email && accessToken) {
        // Sync with backend immediately
        const deviceId = localStorage.getItem('iEmail_deviceId');
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const syncResponse = await fetch(`${baseUrl}/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
            picture: user.photoURL,
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
          toast.success(`Welcome, ${user.displayName || user.email}!`, {
            title: 'Signed in successfully',
          });
        } else {
          // If sync fails, the user is not truly authenticated for our app
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
        // User voluntarily dismissed the Google popup; ignore cleanly
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#161B22] border border-[#30363D] flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 border-2 border-[#58A6FF] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono font-medium text-[#E6EDF3]">Signing in...</span>
            <span className="text-[11px] font-mono text-[#8B949E]">Connecting your Google account</span>
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

  // Default fallback to Landing Page
  return <LandingPage onLaunch={handleLogin} onLogin={handleLogin} />;
}

