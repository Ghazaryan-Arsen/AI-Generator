import React from 'react';
import { Download, Trash2, Heart, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GalleryItem } from '../App';

interface ImageCardProps {
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (url: string, filename: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  item,
  onSelect,
  onDelete,
  onDownload,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group relative shadow-lg"
      onClick={() => onSelect(item)}
    >
      <img src={item.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3">
        <div className="flex justify-between items-start">
          <button
            onClick={(e) => onToggleFavorite(item.id, e)}
            className={`p-2 rounded-xl transition-all backdrop-blur-md ${
              item.isFavorite
                ? 'bg-pink-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopyPrompt}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-md"
              title="Copy Prompt"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
            <button
              onClick={(e) => onDelete(item.id, e)}
              className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all backdrop-blur-md"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
          <button
            onClick={(e) => onDownload(item.url, `ai-image-${item.id}.jpg`, e)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-md"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageCard;
