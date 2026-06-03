import React, { useState, useEffect, useCallback } from 'react';
import { useImageGeneration } from './hooks/useImageGeneration';
 fix/ai-image-generator-stability-9149027563044618605
import { Download, Trash2, Image as ImageIcon, AlertCircle, Sparkles, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast, ToastContainer } from './components/Toast';
import type { ToastType } from './components/Toast';
import Header from './components/Header';
import Controls from './components/Controls';
import Preview from './components/Preview';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';
import Login from './components/Login';
import Register from './components/Register';
import Pricing from './components/Pricing';
 main

export interface GalleryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  isFavorite?: boolean;
}

type View = 'generator' | 'login' | 'register' | 'pricing';

const App: React.FC = () => {
  const [view, setView] = useState<View>('generator');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('image_gallery');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  const { currentJob, isLoading, error, generate, cancel } = useImageGeneration();

  const addToast = useCallback((message: string, type: ToastType) => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    localStorage.setItem('image_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    if (currentJob?.status === 'completed' && currentJob.imageUrl) {
      const newItem: GalleryItem = {
        id: currentJob.id,
        url: currentJob.imageUrl,
        prompt: currentJob.prompt,
        timestamp: Date.now(),
      };
      setGallery(prev => [newItem, ...prev]);
      addToast('Image generated successfully!', 'success');
    } else if (currentJob?.status === 'failed') {
      addToast(error || 'Generation failed', 'error');
    }
  }, [currentJob?.status, currentJob?.imageUrl, currentJob?.id, currentJob?.prompt, error, addToast]);

  const handleGenerate = useCallback(() => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;
    generate(trimmedPrompt, style, aspectRatio);
  }, [prompt, isLoading, style, aspectRatio, generate]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleDownload = useCallback(async (url: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
    setSelectedImage(prev => {
      if (prev?.id === id) {
        return { ...prev, isFavorite: !prev.isFavorite };
      }
      return prev;
    });
  }, []);

  const renderView = () => {
    switch (view) {
      case 'login': return <Login onBack={() => setView('generator')} onRegister={() => setView('register')} />;
      case 'register': return <Register onBack={() => setView('generator')} onLogin={() => setView('login')} />;
      case 'pricing': return <Pricing onBack={() => setView('generator')} />;
      default: return (
        <>
          <Header onLogin={() => setView('login')} onPricing={() => setView('pricing')} />

          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <Controls
              prompt={prompt}
              setPrompt={setPrompt}
              style={style}
              setStyle={setStyle}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              isLoading={isLoading}
              handleGenerate={handleGenerate}
              cancel={cancel}
            />

            <Preview
              isLoading={isLoading}
              error={error}
              currentJob={currentJob}
              handleGenerate={handleGenerate}
              handleDownload={handleDownload}
            />
          </main>

          <Gallery
            gallery={gallery}
            onSelect={setSelectedImage}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onToggleFavorite={toggleFavorite}
          />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
 ai-image-generator-improvements-8591800724981460221
        {renderView()}

        <header className="text-center mb-12 space-y-4">
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

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Section */}
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
                    {['Realistic', 'Digital Art', 'Oil Painting', 'Anime', 'Cyberpunk'].map(s => (
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
                    {['1:1', '16:9', '4:3', '9:16'].map(r => (
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
                  disabled={!prompt.trim() || isLoading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
                    !prompt.trim() || isLoading
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-500/20 active:scale-[0.98]'
                  }`}
                >
                  <Sparkles size={20} />
                  {isLoading ? 'Processing...' : 'Generate Masterpiece'}
                </button>
              )}
            </div>
          </section>

          {/* Preview Section */}
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
                        {currentJob?.status === 'pending' ? 'In Queue...' : 'Generating Image...'}
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
                    className="w-full h-full relative group"
                  >
                    <img
                      src={currentJob.imageUrl}
                      alt="Generated"
                      className="w-full h-full object-cover max-h-[600px]"
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
        </main>

        {/* Gallery Section */}
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
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group relative shadow-lg"
                    onClick={() => setSelectedImage(item)}
                  >
                    <img src={item.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3">
                      <div className="flex justify-between items-start">
                        <button
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`p-2 rounded-xl transition-all backdrop-blur-md ${
                            item.isFavorite
                              ? 'bg-pink-500 text-white'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all backdrop-blur-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => handleDownload(item.url, `ai-image-${item.id}.jpg`, e)}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-md"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
 main
      </div>

      <Lightbox
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        onToggleFavorite={toggleFavorite}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      <footer className="mt-24 py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Image Generator. Optimized for Maximum Performance.</p>
      </footer>

      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </div>
  );
};

export default App;
