import React from 'react';
import { Download, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job } from '../types';

interface PreviewProps {
  isLoading: boolean;
  error: string | null;
  currentJob: Job | null;
  handleGenerate: () => void;
  handleDownload: (url: string, filename: string, e: React.MouseEvent) => void;
}

const Preview: React.FC<PreviewProps> = ({
  isLoading,
  error,
  currentJob,
  handleGenerate,
  handleDownload,
}) => {
  return (
    <section className="lg:col-span-7">
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative shadow-2xl group">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center p-8 space-y-6 text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="text-blue-500/50" size={32} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {currentJob?.status === 'pending' ? 'In Queue...' :
                   currentJob?.progress && currentJob.progress < 30 ? 'Enhancing prompt...' :
                   currentJob?.progress && currentJob.progress < 80 ? 'Generating image...' :
                   'Finalizing artwork...'}
                </h3>
                <p className="text-slate-400 max-w-[280px]">
                  Our AI is processing your request. This usually takes 15-30 seconds.
                </p>
              </div>
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentJob?.progress || 0}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
              <span className="text-blue-400 font-mono text-sm">{currentJob?.progress || 0}% Complete</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 space-y-4"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Generation Failed</h3>
                <p className="text-red-400/80 max-w-xs mx-auto">{error}</p>
              </div>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : currentJob?.imageUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full relative group flex items-center justify-center"
            >
              <img
                src={currentJob.imageUrl}
                alt="Generated"
                className="max-w-full max-h-[600px] object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Prompt</p>
                    <p className="text-sm text-white line-clamp-2 max-w-md italic">"{currentJob.prompt}"</p>
                  </div>
                  <button
                    onClick={(e) => handleDownload(currentJob.imageUrl!, `ai-image-${currentJob.id}.jpg`, e)}
                    className="p-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white shadow-lg transition-transform active:scale-95"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12 space-y-6 opacity-40 group-hover:opacity-60 transition-opacity"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <ImageIcon size={48} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium">Your canvas is empty</p>
                <p className="text-sm">Enter a prompt and click generate to see the magic</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Preview;
