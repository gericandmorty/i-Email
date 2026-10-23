"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Shield, Zap, ArrowRight, CheckCircle2, LogIn, FileUp, PenTool, Send, ChevronLeft, BookOpen, Lightbulb } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui-components';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function DocumentationPage() {
    const steps = [
        {
            icon: LogIn,
            step: "01",
            title: "Sign In with Google",
            description: "Sign in safely using your regular Gmail or Google Workspace account. We only ask for permission to send emails you approve—we never see your password."
        },
        {
            icon: FileUp,
            step: "02",
            title: "Upload Your Contact List",
            description: "Upload an Excel (.xlsx) or CSV file with your contacts. iEmail automatically reads your column names (like Name, Email, or Company) so you can use them in your message."
        },
        {
            icon: PenTool,
            step: "03",
            title: "Write Your Message",
            description: "Type your subject and email body. Use tags like {{Name}} or {{Company}} to automatically fill in each person's real details."
        },
        {
            icon: Send,
            step: "04",
            title: "Preview & Send",
            description: "Click through your contacts to see exactly how each email will look. Choose your sending speed, then click Send to deliver your emails."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
            {/* Header / Navbar */}
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">
                <div className="space-y-10">
                    {/* Header */}
                    <div className="border-b border-[#30363D] pb-6 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#E6EDF3]">
                            How to Use iEmail
                        </h1>
                        <p className="text-sm text-[#8B949E]">
                            A simple, step-by-step guide to sending personalized emails to your contacts.
                        </p>
                    </div>

                    {/* Step-by-step guides */}
                    <div className="space-y-4">
                        {steps.map((step, i) => (
                            <Card key={i} className="p-5 bg-[#161B22] border-[#30363D] hover:border-[#58A6FF]/40 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-md bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#58A6FF] shrink-0 mt-0.5">
                                        <step.icon size={16} />
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[11px] text-[#8B949E] px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D]">
                                                Step {step.step}
                                            </span>
                                            <h3 className="text-sm font-semibold text-[#E6EDF3]">{step.title}</h3>
                                        </div>
                                        <p className="text-xs text-[#8B949E] leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pro Tip Box */}
                    <div className="p-5 rounded-lg bg-[#161B22] border border-[#388BFD]/40 space-y-2">
                        <div className="flex items-center gap-2 text-[#58A6FF] text-xs font-semibold">
                            <Lightbulb size={15} />
                            <span>Helpful Tip: Personalize with Any Column</span>
                        </div>
                        <p className="text-xs text-[#8B949E] leading-relaxed">
                            You can use any column from your spreadsheet in your email! For example, if your file has a column called <code className="bg-[#0D1117] px-1 py-0.5 rounded text-[#58A6FF] font-mono border border-[#30363D]">First Name</code>, simply click or type <code className="bg-[#0D1117] px-1 py-0.5 rounded text-[#58A6FF] font-mono border border-[#30363D]">&#123;&#123;First Name&#125;&#125;</code> in your message. When sent, each recipient will see their own first name.
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#30363D]">
                        <Link href="/" className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors flex items-center gap-1.5">
                            <ChevronLeft size={14} /> Back to Home
                        </Link>
                        <Link href="/">
                            <Button variant="primary" size="default">
                                Start Sending <ArrowRight size={14} className="ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
