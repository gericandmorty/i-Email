"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileCode, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui-components';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="border-b border-[#30363D] pb-6 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#E6EDF3]">
                            Privacy Policy
                        </h1>
                        <p className="text-xs text-[#8B949E]">
                            Clear and simple: how we protect your information.
                        </p>
                    </div>

                    <Card className="p-6 space-y-8 bg-[#161B22] border-[#30363D]">
                        <section className="space-y-2.5">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">01.</span> We Never Save or Sell Your Data
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                We never store, read, or sell your email messages or your contact lists. Your emails and contacts stay on your device and are never saved to our servers.
                            </p>
                        </section>

                        <section className="space-y-2.5 pt-4 border-t border-[#30363D]">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">02.</span> Safe Google Sign-In
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                You sign in securely through Google. We never see or store your Google password. Your login is kept safe inside your browser so you can send your emails directly.
                            </p>
                        </section>

                        <section className="space-y-2.5 pt-4 border-t border-[#30363D]">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">03.</span> We Only Ask for Send Permission
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                We only ask for the minimum permission required: <code className="bg-[#0D1117] px-1 py-0.5 rounded text-[#58A6FF] font-mono text-[11px] border border-[#30363D]">gmail.send</code>. This allows iEmail to deliver the messages you write. We cannot read your inbox, delete your emails, or view your private conversations.
                            </p>
                        </section>

                        <section className="space-y-2.5 pt-4 border-t border-[#30363D]">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">04.</span> Files Stay on Your Computer
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                When you select an Excel or CSV file, it is opened right inside your web browser. Your contact spreadsheets are never uploaded to any third-party database.
                            </p>
                        </section>
                    </Card>

                    <div className="flex items-center justify-between pt-4">
                        <Link href="/" className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors flex items-center gap-1.5">
                            <ChevronLeft size={14} /> Back to Home
                        </Link>
                        <Link href="/tos" className="text-xs text-[#58A6FF] hover:underline">
                            Read Terms of Service →
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
