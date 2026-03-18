"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, User, Github } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function TermsOfService() {
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
                        <FileText size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black tracking-tighter uppercase italic leading-none"
                    >
                        Terms of Service
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
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Standard of Use</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            By utilizing the iEmail platform, you agree to adhere to ethical dispatch protocols. This system is designed for professional seeding and communication. Spamming or malicious broadcasting is strictly prohibited.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">02</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Third-Party Alignment</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            The system integrates with Google APIs. Users must comply with Google's Workspace and API Terms of Service. Any violation that leads to account suspension is the sole responsibility of the user.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">03</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Operational Liability</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            iEmail provides its protocol "as is." While we optimize for high-speed delivery and parallel processing, we do not guarantee inbox placement or specific conversion rates.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-black text-[#94B4C1]/30 italic">04</span>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">System Integrity</h2>
                        </div>
                        <p className="text-[#547792] font-bold text-lg leading-relaxed opacity-90">
                            Users are responsible for maintaining the security of their local credentials stored in the system database. We recommend full-disk encryption and secure system access to prevent unauthorized dispatch.
                        </p>
                    </section>
                </motion.div>



            </div>
            <Footer className="border-t border-[#213448]/5 mt-20" />
        </div>
    );
}
