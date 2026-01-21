import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { generateFlashcards } from '../services/geminiService';
import { Flashcard } from '../types';
import { Sparkles, RotateCw, Check, X } from 'lucide-react';

export const Flashcards: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    setLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    
    const generated = await generateFlashcards(topic);
    setCards(generated);
    setLoading(false);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(curr => curr + 1);
        } else {
            // Loop or finish
            setCurrentIndex(0);
        }
    }, 200);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900">AI Flashcards</h1>
            <p className="text-gray-500 mt-2">Enter a topic and let AI generate study material for you.</p>
        </div>

        {/* Generator Input */}
        <form onSubmit={handleGenerate} className="flex gap-2 mb-10">
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., React Lifecycle Methods, Python Lists..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
            <button 
                type="submit" 
                disabled={loading || !topic}
                className="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
                {loading ? <RotateCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Generate
            </button>
        </form>

        {/* Card Display */}
        {cards.length > 0 ? (
            <div className="relative h-80 perspective-1000">
                <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white border-2 border-brand-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
                        <span className="absolute top-6 left-6 text-xs font-bold text-brand-500 uppercase tracking-widest">Question {currentIndex + 1}/{cards.length}</span>
                        <h3 className="text-2xl font-bold text-gray-800">{cards[currentIndex].front}</h3>
                        <p className="absolute bottom-6 text-sm text-gray-400">Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-brand-600 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center rotate-y-180" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <span className="absolute top-6 left-6 text-xs font-bold text-brand-200 uppercase tracking-widest">Answer</span>
                        <p className="text-xl leading-relaxed font-medium">{cards[currentIndex].back}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={nextCard} className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors">
                        <X size={24} />
                    </button>
                    <button onClick={nextCard} className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                        <Check size={24} />
                    </button>
                </div>
            </div>
        ) : !loading && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Sparkles className="text-gray-400" size={32} />
                </div>
                <h3 className="text-gray-500 font-medium">Ready to learn?</h3>
                <p className="text-sm text-gray-400">Type a topic above to generate flashcards.</p>
            </div>
        )}
      </div>
    </Layout>
  );
};
