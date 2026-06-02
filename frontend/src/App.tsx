import React, { useState, useEffect } from 'react';
import { useImageGeneration } from './hooks/useImageGeneration';
import Header from './components/Header';
import Controls from './components/Controls';
import Preview from './components/Preview';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';
import Login from './components/Login';
import Register from './components/Register';
import Pricing from './components/Pricing';
import { BASE_URL } from './api';

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

  const { currentJob, isLoading, error, generate, cancel } = useImageGeneration();

  useEffect(() => {
    localStorage.setItem('image_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    if (currentJob?.status === 'completed' && currentJob.imageUrl) {
      // Ensure absolute URL if BASE_URL is present
      const fullUrl = currentJob.imageUrl.startsWith('http')
        ? currentJob.imageUrl
        : `${BASE_URL}${currentJob.imageUrl}`;

      const newItem: GalleryItem = {
        id: currentJob.id,
        url: fullUrl,
        prompt: currentJob.prompt,
        timestamp: Date.now(),
      };
      setGallery(prev => [newItem, ...prev]);
    }
  }, [currentJob?.status, currentJob?.imageUrl, currentJob?.id, currentJob?.prompt]);

  const handleGenerate = () => {
    if (!prompt || isLoading) return;
    generate(prompt, style, aspectRatio);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const handleDownload = async (url: string, filename: string, e: React.MouseEvent) => {
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
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
    if (selectedImage?.id === id) {
      setSelectedImage(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

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
              baseUrl={BASE_URL}
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
        {renderView()}
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
    </div>
  );
};

export default App;
