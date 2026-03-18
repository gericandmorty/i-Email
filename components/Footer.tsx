import React from 'react';
import { Github, Facebook, Bug } from 'lucide-react';

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
    return (
        <footer className={`w-full py-12 px-6 ${className || ''}`}>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2 text-[#213448] opacity-60">
                        <Bug size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Experience any bugs?</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#94B4C1] uppercase tracking-[0.2em]">Help me improve iEmail</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#213448] mb-1">Contact me:</span>
                    <div className="flex gap-8">
                        <a
                            href="https://github.com/gericandmorty"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#94B4C1] hover:text-[#213448] transition-all group"
                        >
                            <Github size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">gericandmorty</span>
                        </a>
                        <a
                            href="https://web.facebook.com/geric.morit.t/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#94B4C1] hover:text-[#213448] transition-all group"
                        >
                            <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Geric Morit</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#213448]/5 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center gap-8">
                    <a href="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94B4C1] hover:text-[#213448] transition-all">Privacy Policy</a>
                    <a href="/tos" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94B4C1] hover:text-[#213448] transition-all">Terms of Service</a>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#213448]/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#94B4C1]">iEmail</span>
                    <div className="w-2 h-2 rounded-full bg-[#213448]/10" />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#94B4C1]/50">
                    &copy; 2026 Crafted for Performance
                </p>
            </div>
        </footer>
    );
};
