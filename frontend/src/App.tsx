import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('image_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('image_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const { generateImage } = await import('./api');
      const data = await generateImage(prompt, style, aspectRatio);
      if (data.success) {
        setImageUrl(data.imageUrl);
        setHistory([data.imageUrl, ...history]);
      } else {
        setError(data.message || 'Failed to generate image');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-slate-400 mt-2">Turn your imagination into art</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Prompt</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px] resize-none"
                placeholder="Describe what you want to see..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Style</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option>Realistic</option>
                  <option>Digital Art</option>
                  <option>Oil Painting</option>
                  <option>Anime</option>
                  <option>Cyberpunk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Aspect Ratio</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                >
                  <option>1:1</option>
                  <option>16:9</option>
                  <option>4:3</option>
                  <option>9:16</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                isLoading || !prompt
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/20'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[400px] relative transition-all duration-500">
            {isLoading ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 font-medium">AI is crafting your masterpiece...</p>
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-400 font-medium">{error}</p>
                <button 
                  onClick={handleGenerate}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Try again
                </button>
              </div>
            ) : imageUrl ? (
              <div className="w-full h-full animate-in fade-in duration-700">
                <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                <a 
                  href={imageUrl} 
                  download="generated-image.jpg"
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-lg backdrop-blur-sm transition-colors"
                >
                  📥 Download
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-500 p-8">
                <div className="text-6xl mb-4 opacity-20">🎨</div>
                <p>Your generated image will appear here</p>
              </div>
            )}
          </div>
        </main>

        {/* Gallery Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Gallery History</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {history.map((url, index) => (
              <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-colors cursor-pointer group relative">
                <img src={url} alt={`History ${index}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-sm font-medium">View</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                No images generated yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
