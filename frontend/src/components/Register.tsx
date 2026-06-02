import React from 'react';
import { UserPlus, Sparkles, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onBack: () => void;
  onLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onLogin }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors self-start ml-4 md:ml-0"
      >
        <ArrowLeft size={20} />
        Back to Generator
      </button>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] max-w-md w-full space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-500 mb-4">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400">Join the future of AI generation</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Password</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            <UserPlus size={20} />
            Register (Coming Soon)
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Already have an account? <button onClick={onLogin} className="text-blue-400 font-bold cursor-pointer hover:text-blue-300">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
