"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Shield,
    ArrowRight,
    CheckCircle2,
    Lock,
    FileSpreadsheet,
    Send,
    Layers,
    Clock,
    Check
} from 'lucide-react';
import { Button, Card } from './ui-components';
import Link from 'next/link';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { LoginModal } from './LoginModal';

interface LandingPageProps {
    onLaunch: () => void;
    onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onLogin }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleOpenAuth = () => {
        setIsLoginModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
            {/* Top Navigation */}
            <Navbar onLogin={handleOpenAuth} />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-[#30363D]">
                <div
                    className="absolute inset-0 opacity-[0.15] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#30363D 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Hero Left Content */}
                        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#E6EDF3] leading-[1.15]">
                                Send personalized emails <br className="hidden sm:inline" />
                                <span className="text-[#58A6FF]">to everyone in minutes.</span>
                            </h1>

                            <p className="text-sm sm:text-base text-[#8B949E] leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Upload your list from Excel or CSV, personalize each email with their name, and send them safely using your regular Google or Gmail account.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={onLaunch}
                                    className="w-full sm:w-auto h-10 px-5 text-xs font-semibold"
                                >
                                    Get started <ArrowRight size={14} className="ml-2" />
                                </Button>

                                <button
                                    onClick={handleOpenAuth}
                                    className="w-full sm:w-auto h-10 px-4 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] hover:text-[#E6EDF3] border border-[#30363D] rounded-md text-xs font-medium flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-[#8B949E]">
                                <span className="flex items-center gap-1.5">
                                    <Check size={14} className="text-[#3FB950]" /> Free to use
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Check size={14} className="text-[#3FB950]" /> Works with your Gmail
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Check size={14} className="text-[#3FB950]" /> Private & secure
                                </span>
                            </div>
                        </div>

                        {/* Hero Right: Product UI Mockup */}
                        <div className="lg:col-span-6">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="rounded-xl border border-[#30363D] bg-[#161B22] shadow-2xl overflow-hidden"
                            >
                                {/* Window titlebar */}
                                <div className="h-9 px-4 bg-[#0D1117] border-b border-[#30363D] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                                        <span className="ml-2 text-[11px] font-mono text-[#8B949E]">iEmail — New Message</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
                                        <span className="text-[10px] text-[#8B949E]">Google account connected</span>
                                    </div>
                                </div>

                                {/* Mock Interface Contents */}
                                <div className="p-4 sm:p-5 space-y-4 font-sans text-xs">
                                    {/* Top Step Bar */}
                                    <div className="flex items-center justify-between p-2.5 bg-[#0D1117] rounded-md border border-[#30363D]">
                                        <div className="flex items-center gap-2 text-[#3FB950]">
                                            <CheckCircle2 size={13} />
                                            <span className="font-medium">1. Contacts (148 added)</span>
                                        </div>
                                        <div className="h-3 w-px bg-[#30363D]" />
                                        <div className="flex items-center gap-2 text-[#58A6FF] font-semibold">
                                            <span className="w-4 h-4 rounded-full bg-[#58A6FF]/20 flex items-center justify-center text-[10px]">2</span>
                                            <span>2. Write Message</span>
                                        </div>
                                        <div className="h-3 w-px bg-[#30363D]" />
                                        <div className="flex items-center gap-2 text-[#8B949E]">
                                            <span className="w-4 h-4 rounded-full bg-[#21262D] flex items-center justify-center text-[10px]">3</span>
                                            <span>3. Preview & Send</span>
                                        </div>
                                    </div>

                                    {/* Mock Editor Box */}
                                    <div className="space-y-3 bg-[#0D1117] p-3.5 rounded-md border border-[#30363D]">
                                        <div className="flex items-center justify-between border-b border-[#30363D] pb-2 text-[11px]">
                                            <span className="text-[#8B949E]">Subject:</span>
                                            <span className="font-mono text-[#E6EDF3] bg-[#161B22] px-2 py-0.5 rounded border border-[#30363D]">
                                                Welcome aboard, &#123;&#123;name&#125;&#125;! 👋
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-[#8B949E] text-[11px]">
                                            <p className="text-[#E6EDF3]">Hi &#123;&#123;name&#125;&#125;,</p>
                                            <p>Thanks for joining us from <span className="text-[#58A6FF] font-mono">&#123;&#123;company&#125;&#125;</span>. Your account is ready to go!</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-[#30363D] text-[10px]">
                                            <div className="flex gap-1.5">
                                                <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#58A6FF] font-mono border border-[#30363D]">&#123;&#123;name&#125;&#125;</span>
                                                <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#58A6FF] font-mono border border-[#30363D]">&#123;&#123;email&#125;&#125;</span>
                                                <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#58A6FF] font-mono border border-[#30363D]">&#123;&#123;company&#125;&#125;</span>
                                            </div>
                                            <span className="text-[#8B949E]">Delay: 2 seconds between emails</span>
                                        </div>
                                    </div>

                                    {/* Mock Bottom Actions */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2 text-[#8B949E] text-[11px]">
                                            <FileSpreadsheet size={13} className="text-[#3FB950]" />
                                            <span>my_contacts.csv</span>
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-1 rounded bg-[#238636] text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                                                <Send size={11} /> Ready to Send
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EDF3]">
                        Everything you need to send emails easily
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8B949E]">
                        Simple controls, safe sending, and zero headache.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            icon: Shield,
                            title: "Safe Google Sign-In",
                            desc: "Sign in with your regular Google account. We never see or store your password.",
                            accent: "text-[#58A6FF]"
                        },
                        {
                            icon: Clock,
                            title: "Adjust Sending Speed",
                            desc: "Set a short pause between emails so you stay within Google's daily sending limits and land in the inbox.",
                            accent: "text-[#3FB950]"
                        },
                        {
                            icon: Layers,
                            title: "Automatic Name Tags",
                            desc: "Use placeholders like {{name}} or {{company}} to make every single email feel personal and unique.",
                            accent: "text-[#D29922]"
                        },
                        {
                            icon: Lock,
                            title: "100% Private",
                            desc: "Your contact lists stay on your device. We do not store, view, or sell your contacts or emails.",
                            accent: "text-[#F85149]"
                        }
                    ].map((feature, i) => (
                        <Card key={i} className="p-5 hover:border-[#58A6FF]/40 transition-colors bg-[#161B22] flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className={`w-8 h-8 rounded-md bg-[#21262D] border border-[#30363D] flex items-center justify-center ${feature.accent}`}>
                                    <feature.icon size={16} />
                                </div>
                                <h3 className="text-sm font-semibold text-[#E6EDF3]">{feature.title}</h3>
                                <p className="text-xs text-[#8B949E] leading-relaxed">{feature.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-[#161B22]/50 border-y border-[#30363D]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EDF3]">
                            Four simple steps to send your emails
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                step: "1",
                                title: "Sign In",
                                desc: "Log in with your Google account so emails are sent directly from your own email address."
                            },
                            {
                                step: "2",
                                title: "Upload Your List",
                                desc: "Upload an Excel or CSV file containing your contacts' emails and names."
                            },
                            {
                                step: "3",
                                title: "Write Your Message",
                                desc: "Write what you want to say and insert tags like {{name}} to personalize each email."
                            },
                            {
                                step: "4",
                                title: "Preview & Send",
                                desc: "Check how the email looks for each person, then click Send to deliver your emails."
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-lg border border-[#30363D] bg-[#161B22] space-y-3 relative">
                                <span className="text-xs font-semibold text-[#58A6FF] px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D] inline-block">
                                    Step {item.step}
                                </span>
                                <h3 className="text-sm font-semibold text-[#E6EDF3]">{item.title}</h3>
                                <p className="text-xs text-[#8B949E] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security & Privacy Section */}
            <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
                <div className="p-6 sm:p-8 rounded-xl border border-[#30363D] bg-[#161B22]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363D]">
                        <div className="w-8 h-8 rounded-md bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#3FB950]">
                            <Shield size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#E6EDF3]">Your Privacy & Safety Come First</h3>
                            <p className="text-xs text-[#8B949E]">Here is how we keep your Google account and emails secure</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 text-xs text-[#8B949E]">
                        <div className="space-y-1.5">
                            <span className="font-medium text-[#E6EDF3] block">We only send emails</span>
                            <p className="leading-relaxed">
                                We only ask permission to send messages you write. We cannot read your inbox, delete your messages, or see your private files.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <span className="font-medium text-[#E6EDF3] block">We don't keep your contacts</span>
                            <p className="leading-relaxed">
                                Your contact lists are processed directly on your computer. We do not save or sell your email lists to anyone.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <span className="font-medium text-[#E6EDF3] block">Direct from your Gmail</span>
                            <p className="leading-relaxed">
                                Emails come straight from your real email address, so your recipients know it's really you.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <span className="font-medium text-[#E6EDF3] block">Your templates stay on your device</span>
                            <p className="leading-relaxed">
                                Templates you save stay handy on your device so you can easily reuse them whenever you want.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#30363D] flex flex-wrap items-center justify-between gap-4 text-xs">
                        <span className="text-[#8B949E]">Learn more about our policies:</span>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="text-[#58A6FF] hover:underline">Privacy Policy</Link>
                            <span className="text-[#30363D]">•</span>
                            <Link href="/tos" className="text-[#58A6FF] hover:underline">Terms of Service</Link>
                            <span className="text-[#30363D]">•</span>
                            <Link href="/docs" className="text-[#58A6FF] hover:underline">Help & Docs</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-16 text-center border-t border-[#30363D] bg-[#161B22]/30">
                <div className="max-w-xl mx-auto px-4 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#E6EDF3]">
                        Ready to send your first email batch?
                    </h2>
                    <p className="text-xs text-[#8B949E]">
                        Connect your account and get started in less than two minutes.
                    </p>
                    <div className="pt-2">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onLaunch}
                            className="h-10 px-6 text-xs font-semibold"
                        >
                            Open iEmail <ArrowRight size={14} className="ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={onLogin}
            />
        </div>
    );
};
