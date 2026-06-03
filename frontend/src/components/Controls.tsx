import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface ControlsProps {
  prompt: string;
  setPrompt: (val: string) => void;
  style: string;
  setStyle: (val: string) => void;
  aspectRatio: string;
  setAspectRatio: (val: string) => void;
  isLoading: boolean;
  handleGenerate: () => void;
  cancel: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  prompt,
  setPrompt,
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  isLoading,
  handleGenerate,
  cancel,
}) => {
  const styles = ['Realistic', 'Digital Art', 'Oil Painting', 'Anime', 'Cyberpunk', 'Fantasy', '3D Render', 'Pixel Art'];
  const ratios = ['1:1', '16:9', '9:16', '4:5', '4:3', '3:4'];

  return (
    <section className="lg:col-span-5 space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 ml-1">Your Prompt</label>
          <textarea
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none min-h-[140px] resize-none transition-all placeholder:text-slate-600"
            placeholder="A futuristic city with neon lights and flying cars, digital art style..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Max 500 characters</span>
            <span className={`text-xs font-medium ${prompt.length > 450 ? 'text-amber-500' : 'text-slate-500'}`}>
              {prompt.length}/500
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Art Style</label>
            <select
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer appearance-none"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isLoading}
            >
              {styles.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Aspect Ratio</label>
            <select
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer appearance-none"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isLoading}
            >
              {ratios.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <button
            onClick={cancel}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
            Cancel Generation
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!prompt}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
              !prompt
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-500/20 active:scale-[0.98]'
            }`}
          >
            <Sparkles size={20} />
            Generate Masterpiece
          </button>
        )}
      </div>
    </section>
  );
};

export default Controls;
