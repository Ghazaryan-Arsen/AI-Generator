import React from 'react';
import { Download, Trash2, Heart, X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '../App';

interface LightboxProps {
  selectedImage: GalleryItem | null;
  setSelectedImage: (item: GalleryItem | null) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDownload: (url: string, filename: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  selectedImage,
  setSelectedImage,
  onToggleFavorite,
  onDownload,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 rounded-[32px] overflow-hidden max-w-4xl w-full border border-slate-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square bg-black flex items-center justify-center">
                <img src={selectedImage.url} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div className="p-8 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black">Creation Details</h3>
                      <p className="text-slate-500 text-sm">Generated on {new Date(selectedImage.timestamp).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Prompt Used</label>
                      <button
                        onClick={() => handleCopyPrompt(selectedImage.prompt)}
                        className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1 hover:text-blue-300 transition-colors"
                      >
                        {copied ? <Check size={10} /> : <Copy size={10} />}
                        {copied ? 'Copied' : 'Copy Prompt'}
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 italic text-slate-300">
                      "{selectedImage.prompt}"
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={(e) => onToggleFavorite(selectedImage.id, e)}
                    className={`px-4 py-4 rounded-2xl font-bold transition-all flex items-center justify-center ${
                      selectedImage.isFavorite
                        ? 'bg-pink-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Heart size={20} fill={selectedImage.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={(e) => onDownload(selectedImage.url, `ai-image-${selectedImage.id}.jpg`, e)}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={20} />
                    Download HD
                  </button>
                  <button
                    onClick={(e) => {
                      onDelete(selectedImage.id, e);
                      setSelectedImage(null);
                    }}
                    className="px-4 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
