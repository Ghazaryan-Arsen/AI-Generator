import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onLogin: () => void;
  onPricing: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogin, onPricing }) => {
  return (
    <div className="space-y-8 mb-12">
      <nav className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-500 font-black text-xl tracking-tighter">
          <Sparkles size={24} />
          <span>IMAGINE</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={onPricing}
            className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            <User size={16} />
            Sign In
          </button>
        </div>
      </nav>

      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-2"
        >
          <Sparkles size={14} />
          <span>Production Ready AI</span>
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Experience lightning-fast, high-quality image generation with our optimized stable diffusion pipeline.
        </p>
      </header>
    </div>
  );
};

export default Header;
