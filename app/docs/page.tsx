"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Shield, Zap, ArrowRight, CheckCircle2, LogIn, FileUp, PenTool, Send, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui-components';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function DocumentationPage() {
    const steps = [
        {
            icon: LogIn,
            title: "1. Authenticate",
            description: "Sign in securely using your Google account. We use OAuth 2.0 to ensure your credentials never touch our servers."
        },
        {
            icon: FileUp,
            title: "2. Upload Leads",
            description: "Upload an Excel file (.xlsx or .xls) containing your recipient data. Ensure you have columns for email and name."
        },
        {
            icon: PenTool,
            title: "3. Design Template",
            description: "Create your email subject and body. Use placeholders like {{Name}} to dynamically insert data from your Excel columns."
        },
        {
            icon: Send,
            title: "4. Review & Dispatch",
            description: "Preview your emails to ensure everything looks perfect, then hit Dispatch to send your batch securely via Gmail."
        }
    ];

    return (
        <div className="min-h-screen bg-[#EAE0CF] text-[#213448] selection:bg-[#94B4C1]/20">
            {/* Header / Navbar */}
            <div className="fixed top-6 left-0 right-0 z-[100] px-6">
                <nav className="max-w-5xl mx-auto px-8 py-3 flex justify-between items-center bg-[#EAE0CF]/60 backdrop-blur-xl border border-[#213448]/5 rounded-[32px] shadow-[0_20px_50px_rgba(33,52,72,0.05)]">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-all">
                        <div className="p-2 bg-[#213448] text-[#EAE0CF] rounded-xl shadow-lg">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic">iEmail</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#213448] hover:opacity-70 transition-all">
                            <ChevronLeft size={12} /> Back to Home
                        </Link>
                    </div>
                </nav>
            </div>

            <main className="max-w-4xl mx-auto px-12 pt-40 pb-32">
                <div className="space-y-16">
                    <header className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-7xl font-black uppercase tracking-tighter leading-none"
                        >
                            Documentation
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl font-bold text-[#547792] leading-relaxed max-w-2xl opacity-80"
                        >
                            Everything you need to know to start sending bulk emails with iEmail.
                        </motion.p>
                    </header>

                    <div className="grid md:grid-cols-2 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="group relative bg-white/40 backdrop-blur-sm border-2 border-[#213448]/5 rounded-[40px] p-10 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(33,52,72,0.08)] hover:scale-[1.02] transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#213448] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col gap-8 items-start">
                                    <div className="flex-shrink-0 w-20 h-20 bg-[#213448] text-[#EAE0CF] rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                        <step.icon size={32} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#94B4C1]">Step {i + 1}</span>
                                            <div className="h-px flex-1 bg-[#213448]/5 min-w-[20px]" />
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tight italic text-[#213448]">{step.title.split('. ')[1]}</h3>
                                        <p className="text-lg font-bold text-[#547792] leading-relaxed opacity-80 max-w-xl">{step.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-[#213448] p-12 rounded-[44px] text-[#EAE0CF] space-y-6 shadow-[0_50px_100px_rgba(33,52,72,0.2)] relative overflow-hidden group border-4 border-[#EAE0CF]/10"
                    >
                        <CheckCircle2 className="absolute -right-16 -bottom-16 w-64 h-64 text-[#94B4C1]/10 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative space-y-4">
                            <h4 className="text-2xl font-black uppercase tracking-widest italic">Pro Tip: Personalization</h4>
                            <p className="text-lg font-bold leading-relaxed opacity-70">
                                You can use any column header from your Excel as a placeholder. For example, if you have a "Company" column, use <span className="text-[#94B4C1]">{"{{Company}}"}</span> in your email text. This allows for hyper-personalized outreach at scale.
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex justify-center pt-8">
                        <Link href="/">
                            <Button size="lg" className="h-20 px-16 rounded-[32px] text-xl">
                                Ready to Start <ArrowRight className="ml-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>


            <Footer className="border-t border-[#213448]/5 mt-20" />
        </div>
    );
}
