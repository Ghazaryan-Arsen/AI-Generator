import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ImageCard from './ImageCard';
import type { GalleryItem } from '../App';

interface GalleryProps {
  gallery: GalleryItem[];
  onSelect: (item: GalleryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (url: string, filename: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

const Gallery: React.FC<GalleryProps> = ({
  gallery,
  onSelect,
  onDelete,
  onDownload,
  onToggleFavorite,
}) => {
  return (
    <section className="mt-24 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Recent Creations</h2>
          <p className="text-slate-500">Your personal history of AI-generated art</p>
        </div>
        <div className="px-4 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest">
          {gallery.length} Images
        </div>
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence initial={false}>
            {gallery.map((item) => (
              <ImageCard
                key={item.id}
                item={item}
                onSelect={onSelect}
                onDelete={onDelete}
                onDownload={onDownload}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-800/50">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
            <ImageIcon size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 font-medium">No images generated yet</p>
            <p className="text-slate-600 text-sm">Start creating to build your collection</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
