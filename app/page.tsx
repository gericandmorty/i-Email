"use client";

import React, { useState } from 'react';
import EmailSeeder from "@/components/EmailSeeder";
import { LandingPage } from "@/components/LandingPage";
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, User, GoogleAuthProvider } from 'firebase/auth';

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
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
          const url = new URL(`${baseUrl}/auth/accounts`);
          const currentDeviceId = localStorage.getItem('iEmail_deviceId');
          if (currentDeviceId) {
            url.searchParams.append('deviceId', currentDeviceId);
          }
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            setInitialAccounts(data.accounts || []);
          }
        } catch (e) {
          console.error("Gateway account fetch error:", e);
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
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Authentication protocol failed. Please verify credentials.');
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
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EAE0CF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#213448]/10 rounded-full" />
            <div className="absolute top-0 w-16 h-16 border-4 border-[#213448] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#213448]">Authenticating...</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#94B4C1]">Verifying Security Protocol</span>
          </div>
        </div>
      </div>
    );
  }

  // Strictly render EmailSeeder ONLY if authenticated
  if (user) {
    return (
      <main className="min-h-screen bg-zinc-50/50">
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
