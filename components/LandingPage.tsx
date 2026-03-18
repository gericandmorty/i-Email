import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui-components';
import Link from 'next/link';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

interface LandingPageProps {
    onLaunch: () => void;
    onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onLogin }) => {
    return (
        <div className="min-h-screen bg-[#EAE0CF] text-[#213448] selection:bg-[#94B4C1]/20">
            {/* Header / Navbar */}
            <Navbar onLogin={onLogin} />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-12 pt-32 pb-40">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl lg:text-[140px] font-black tracking-tighter uppercase leading-[0.8] italic"
                        >
                            i<span className="text-[#94B4C1]">Email</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base md:text-lg font-bold text-[#547792] leading-relaxed max-w-lg opacity-80"
                        >
                            iEmail is a powerful bulk email solution that streamlines your outreach. Upload your recipient data, craft dynamic templates, and dispatch personalized emails directly through your secure Google account.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-6 items-center"
                        >
                            <Button
                                onClick={onLaunch}
                                size="lg"
                                className="h-16 md:h-20 px-8 md:px-12 rounded-[24px] md:rounded-[32px] bg-[#213448] hover:bg-[#547792] text-lg md:text-xl w-full sm:w-auto"
                            >
                                Get Started <ArrowRight className="ml-4" />
                            </Button>

                            <Button
                                onClick={onLogin}
                                size="lg"
                                variant="outline"
                                className="h-16 md:h-20 px-8 md:px-12 rounded-[24px] md:rounded-[32px] border-2 border-[#213448] text-[#213448] hover:bg-[#213448] hover:text-[#EAE0CF] text-lg md:text-xl transition-all w-full sm:w-auto"
                            >
                                <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    <path fill="none" d="M1 1 23 23" />
                                </svg>
                                Sign in with Google
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 1 }}
                        className="relative"
                    >
                        {/* Mock Dashboard Preview */}
                        <div className="bg-white rounded-[32px] md:rounded-[44px] shadow-[0_50px_100px_-20px_rgba(33,52,72,0.15)] border-4 border-[#213448]/5 overflow-hidden p-4 md:p-8 aspect-[4/3] flex flex-col gap-4 md:gap-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#EAE0CF]" />
                                    <div className="w-3 h-3 rounded-full bg-[#EAE0CF]" />
                                    <div className="w-3 h-3 rounded-full bg-[#EAE0CF]" />
                                </div>
                                <div className="h-6 w-32 bg-[#EAE0CF] rounded-full" />
                            </div>
                            <div className="flex-1 grid grid-cols-3 gap-6">
                                <div className="col-span-1 border-2 border-[#EAE0CF] rounded-3xl p-6 space-y-4">
                                    <div className="h-4 w-full bg-[#EAE0CF] rounded-full" />
                                    <div className="h-4 w-2/3 bg-[#EAE0CF] rounded-full" />
                                    <div className="h-4 w-4/5 bg-[#EAE0CF] rounded-full" />
                                </div>
                                <div className="col-span-2 bg-[#EAE0CF]/30 rounded-[32px] p-8 relative flex flex-col justify-center items-center text-center">
                                    <Sparkles className="text-[#94B4C1] mb-4" size={48} />
                                    <p className="text-[#94B4C1] font-black uppercase tracking-widest text-[10px]">Ready to Send</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative floating elements */}
                        <div className="absolute -top-12 -right-12 p-8 bg-[#213448] text-[#EAE0CF] rounded-[32px] shadow-2xl rotate-12">
                            <Zap size={32} />
                        </div>
                        <div className="absolute -bottom-8 -left-8 p-6 bg-[#94B4C1] text-[#213448] rounded-2xl shadow-2xl -rotate-6">
                            <Shield size={24} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How it Works / Functionality Section */}
            <section className="bg-white/30 py-24 md:py-40">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20 space-y-4"
                    >
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Simple Workflow</h2>
                        <p className="text-[#94B4C1] font-black text-[10px] uppercase tracking-[0.4em]">From Excel to Outbox in Minutes</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-12">
                        {[
                            { step: "01", title: "Verify", desc: "Connect your Google account securely via OAuth 2.0." },
                            { step: "02", title: "Import", desc: "Upload your recipient list in Excel or CSV format." },
                            { step: "03", title: "Personalize", desc: "Map your columns to dynamic placeholders in your template." },
                            { step: "04", title: "Dispatch", desc: "Preview each message and send directly through Gmail servers." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative p-8 rounded-[32px] bg-[#EAE0CF]/20 border border-[#213448]/5"
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#213448] text-[#EAE0CF] flex items-center justify-center font-black italic shadow-xl">{item.step}</span>
                                <h4 className="text-xl font-black uppercase mt-4 mb-3 italic">{item.title}</h4>
                                <p className="text-sm font-bold text-[#547792] leading-relaxed opacity-80">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-[#213448] text-[#EAE0CF] py-24 md:py-40">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-3 gap-16">
                        {[
                            {
                                icon: Mail,
                                title: "Secure Gmail Login",
                                description: "Secure, authenticated integration using Google's modern OAuth 2.0 protocols. We only request 'gmail.send' access to execute your outreach."
                            },
                            {
                                icon: Zap,
                                title: "Smart Throttling",
                                description: "Customizable delays between emails to ensure reliable delivery and respect service provider limits."
                            },
                            {
                                icon: Shield,
                                title: "Data Sovereignty",
                                description: "We do not store your emails or recipient lists. All data processing occurs locally within your secure session."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-6"
                            >
                                <div className="w-16 h-16 bg-[#94B4C1] rounded-2xl flex items-center justify-center">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">{feature.title}</h3>
                                <p className="text-[#94B4C1] font-bold leading-relaxed opacity-80">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Google Compliance / Data Transparency Section */}
            <section className="py-24 md:py-40 max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-12 md:p-20 rounded-[48px] bg-white shadow-2xl shadow-[#213448]/5 border border-[#213448]/5 text-center space-y-10"
                >
                    <div className="w-20 h-20 bg-[#213448] text-[#EAE0CF] rounded-[32px] flex items-center justify-center mx-auto shadow-2xl mb-8">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">Transparency & Security</h2>
                    <p className="text-lg md:text-xl font-bold text-[#547792] leading-relaxed opacity-90 max-w-2xl mx-auto">
                        iEmail is designed with privacy-first architecture. We explicitly define how your data is accessed and used.
                    </p>

                    <div className="grid md:grid-cols-2 gap-10 text-left pt-10">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#94B4C1]">Purpose of Data Request</h4>
                            <p className="text-sm font-bold text-[#213448] leading-relaxed">
                                We request Google OAuth access specifically to send emails on your behalf. This allows you to use your own verified identity for bulk communications.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#94B4C1]">Limited Scopes</h4>
                            <p className="text-sm font-bold text-[#213448] leading-relaxed">
                                Our app limits its authority to the <code className="bg-[#213448]/5 px-1.5 py-0.5 rounded text-[#213448]">gmail.send</code> scope. We cannot read your inbox, delete messages, or access your Drive files.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#94B4C1]">Local Processing</h4>
                            <p className="text-sm font-bold text-[#213448] leading-relaxed">
                                Your recipient lists (Excel/CSV) and email content are parsed directly in your browser. No third party ever sees your sensitive lead data.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#94B4C1]">No Data Retention</h4>
                            <p className="text-sm font-bold text-[#213448] leading-relaxed">
                                We do not store your Google tokens or email data on our servers. Authentication is managed securely via Firebase and local session storage.
                            </p>
                        </div>
                    </div>

                    <div className="pt-10 flex flex-wrap justify-center gap-10">
                        <a href="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94B4C1] hover:text-[#213448] transition-all underline decoration-[#94B4C1]/30 underline-offset-8">Read Privacy Policy</a>
                        <a href="/tos" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94B4C1] hover:text-[#213448] transition-all underline decoration-[#94B4C1]/30 underline-offset-8">Terms of Service</a>
                    </div>
                </motion.div>
            </section>


            <Footer className="border-t border-[#213448]/5 mt-20" />
        </div>
    );
};
