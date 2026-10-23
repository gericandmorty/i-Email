"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui-components';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="border-b border-[#30363D] pb-6 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#E6EDF3]">
                            Terms of Service
                        </h1>
                        <p className="text-xs text-[#8B949E]">
                            Simple rules for using iEmail respectfully and safely.
                        </p>
                    </div>

                    <Card className="p-6 space-y-8 bg-[#161B22] border-[#30363D]">
                        <section className="space-y-2.5">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">01.</span> Friendly & Responsible Sending
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                Please only use iEmail to contact people who know you, opted into your updates, or expect to hear from you. Sending spam, unwanted promotional blasts, or deceptive emails is strictly forbidden.
                            </p>
                        </section>

                        <section className="space-y-2.5 pt-4 border-t border-[#30363D]">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">02.</span> Following Google's Rules
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                Emails are sent directly through your personal or Google Workspace account. Google imposes daily limits (usually 500 emails/day for free Gmail accounts, and 2,000 emails/day for paid Google Workspace accounts).
                            </p>
                        </section>

                        <section className="space-y-2.5 pt-4 border-t border-[#30363D]">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">03.</span> Service Availability
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                iEmail is provided as an open productivity tool to make sending personalized emails simpler. While we provide features like adjustable send speeds to protect your account reputation, we cannot guarantee that every message avoids recipient spam filters.
                            </p>
                        </section>

                        <section className="space-y-2.5 pt-4 border-t border-[#30363D]">
                            <h2 className="text-sm font-semibold text-[#E6EDF3] flex items-center gap-2">
                                <span className="font-mono text-xs text-[#58A6FF]">04.</span> Keeping Your Account Safe
                            </h2>
                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                Your login session is stored on your current device. Remember to sign out if you are using a shared computer or public device so others cannot send emails from your account.
                            </p>
                        </section>
                    </Card>

                    <div className="flex items-center justify-between pt-4">
                        <Link href="/" className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors flex items-center gap-1.5">
                            <ChevronLeft size={14} /> Back to Home
                        </Link>
                        <Link href="/privacy" className="text-xs text-[#58A6FF] hover:underline">
                            Read Privacy Policy →
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
