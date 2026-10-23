import React from 'react';
import { Github, Bug, Shield, FileText, Mail, Heart } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
    return (
        <footer className={`w-full bg-[#0D1117] border-t border-[#30363D] py-10 px-4 sm:px-6 ${className || ''}`}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Brand & Copyright */}
                <div className="flex items-center gap-3 text-xs text-[#8B949E]">
                    <div className="w-5 h-5 rounded bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#58A6FF]">
                        <Mail size={12} />
                    </div>
                    <span>&copy; {new Date().getFullYear()} iEmail. Personalized emails made simple.</span>
                </div>

                {/* Footer Links */}
                <div className="flex flex-wrap items-center gap-5 text-xs text-[#8B949E]">
                    <Link href="/docs" className="hover:text-[#58A6FF] transition-colors">
                        How It Works
                    </Link>
                    <Link href="/privacy" className="hover:text-[#58A6FF] transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/tos" className="hover:text-[#58A6FF] transition-colors">
                        Terms of Service
                    </Link>
                    <a
                        href="https://github.com/gericandmorty"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#58A6FF] transition-colors"
                    >
                        <Github size={14} />
                        <span>GitHub</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};
