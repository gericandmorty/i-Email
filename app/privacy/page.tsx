"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, User, Github } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#EAE0CF] text-[#213448] selection:bg-[#94B4C1]/20">
            {/* Header / Navbar */}
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-40 pb-20">
                <header className="mb-16 space-y-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-[#213448] text-[#EAE0CF] rounded-[32px] flex items-center justify-center mx-auto shadow-2xl"
                    >
                        <Shield size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black tracking-tighter uppercase italic leading-none"
                    >
                        Privacy Policy
                    </motion.h1>
                    <p className="text-[#94B4C1] font-black text-[10px] uppercase tracking-[0.4em]">Protocol Version 2.1 • 2026</p>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/50 backdrop-blur-sm rounded-[48px] p-12 shadow-2xl shadow-[#213448]/5 border border-white/40 space-y-16"
                >
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">01</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Data Sovereignty</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            iEmail prioritizes the absolute security of your dispatch data. We do not store, view, or monetize the contents of your emails or your recipient lists. All processing happens within your secure environment.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">02</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Authentication Protocols</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            The system utilizes Google OAuth 2.0. Your login credentials never touch our servers. We only store encrypted refresh tokens locally on your machine to facilitate automated dispatch.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">03</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Scope of Access</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            We only request access to <code className="bg-[#213448]/5 px-2 py-1 rounded text-[#213448]">gmail.send</code>. this limits the system to sending emails on your behalf and does not allow reading your inbox or modifying account settings.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">04</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Localized Processing</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            All data engineering, including Excel parsing and PDF optimization, occurs within your local execution environment. Your files are never uploaded to any remote server.
                        </p>
                    </section>
                </motion.div>



            </div>
            <Footer className="border-t border-[#213448]/5 mt-20" />
        </div>
    );
}
