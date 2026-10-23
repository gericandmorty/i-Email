"use client";

import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui-components';

import { BrandLogo } from './BrandLogo';

interface NavbarProps {
    onLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin }) => {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'How It Works', href: '/docs' },
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/tos' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-[#161B22]/90 backdrop-blur-md border-b border-[#30363D]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                        <BrandLogo size={28} />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-[#E6EDF3] group-hover:text-white transition-colors">
                        iEmail
                    </span>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    isActive
                                        ? "text-[#E6EDF3] bg-[#21262D]"
                                        : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]/60"
                                )}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {onLogin ? (
                        <>
                            <button
                                onClick={onLogin}
                                className="text-xs font-medium text-[#C9D1D9] hover:text-white transition-colors px-3 py-1.5"
                            >
                                Sign in
                            </button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onLogin}
                                className="hidden sm:inline-flex"
                            >
                                Launch App
                            </Button>
                        </>
                    ) : (
                        <Link href="/">
                            <Button variant="primary" size="sm">
                                Launch App <ArrowRight size={13} className="ml-1" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
