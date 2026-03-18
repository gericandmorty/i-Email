"use client";

import React from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavbarProps {
    onLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin }) => {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/tos' },
        { name: 'Documentation', href: '/docs' },
    ];

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] px-6">
            <nav className="max-w-5xl mx-auto px-8 py-3 flex justify-between items-center bg-[#EAE0CF]/60 backdrop-blur-xl border border-[#213448]/5 rounded-[32px] shadow-[0_20px_50px_rgba(33,52,72,0.05)]">
                <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-all">
                    <div className="p-2 bg-[#213448] text-[#EAE0CF] rounded-xl shadow-lg">
                        <Mail size={16} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase italic">iEmail</span>
                </Link>

                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                    isActive ? "text-[#213448]" : "text-[#94B4C1] hover:text-[#213448]"
                                )}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#213448] rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    {onLogin ? (
                        <button
                            onClick={onLogin}
                            className="text-[9px] font-black uppercase tracking-[0.2em] text-[#213448] hover:opacity-70 transition-all"
                        >
                            Sign In
                        </button>
                    ) : (
                        <Link
                            href="/"
                            className="text-[9px] font-black uppercase tracking-[0.2em] text-[#213448] hover:opacity-70 transition-all"
                        >
                            Get Started
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
};
