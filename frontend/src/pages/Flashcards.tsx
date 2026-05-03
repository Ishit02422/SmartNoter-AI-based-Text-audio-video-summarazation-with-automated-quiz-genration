import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Library, AlertCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import api from '../api';

const Flashcards = () => {
    const location = useLocation();
    const { summaryId, source } = (location.state as any) || {};

    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (summaryId && source) {
            handleFetchFlashcards();
        }
    }, [summaryId, source]);

    const handleFetchFlashcards = async () => {
        setLoading(true);
        setError('');
        try {
            // First try to get existing flashcards
            const res = await api.post('/flashcard/get', { summaryId, source });
            if (res.data && res.data.result && res.data.result.flashcards?.length > 0) {
                setFlashcards(res.data.result.flashcards);
            } else {
                // If none exist, generate new ones
                await handleGenerateFlashcards();
            }
        } catch (err: any) {
            handleGenerateFlashcards();
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        setLoading(true);
        try {
            const res = await api.post('/flashcard/', { summaryId, source });
            if (res.data && res.data.result && res.data.result.flashcards) {
                setFlashcards(res.data.result.flashcards);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate flashcards.');
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    if (!summaryId || !source) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Library className="w-8 h-8 text-indigo-500" />
                        AI Flashcards
                    </h1>
                    <p className="text-slate-500 mt-2">Master your content with quick-study flashcards.</p>
                </div>
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Library className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">No Summary Selected</h2>
                    <p className="text-slate-500 mt-2 max-w-md">
                        Please select a summary first to generate study flashcards.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Library className="w-8 h-8 text-indigo-500" />
                        Quick Study Flashcards
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Flip cards to test your memory.</p>
                </div>
                {flashcards.length > 0 && (
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm">
                        {currentIndex + 1} / {flashcards.length}
                    </div>
                )}
            </header>

            {loading && (
                <div className="bg-white p-20 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
                    <Library className="w-12 h-12 text-indigo-200 animate-bounce mb-4" />
                    <p className="text-slate-500 font-bold">Preparing your study deck...</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex flex-col items-center gap-4 text-center border border-red-100">
                    <AlertCircle className="w-12 h-12" />
                    <p className="font-bold">{error}</p>
                    <button onClick={handleGenerateFlashcards} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">Retry</button>
                </div>
            )}

            {flashcards.length > 0 && !loading && (
                <div className="flex flex-col items-center gap-12">
                    {/* The Flashcard Container */}
                    <div 
                        className={`relative w-full max-w-lg aspect-[4/3] cursor-pointer perspective-1000 group`}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front Side */}
                            <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-2xl flex flex-col items-center justify-center p-10 text-center">
                                <span className="absolute top-6 left-6 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">Question</span>
                                <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden bg-slate-50">
                                    {flashcards[currentIndex].imageUrl ? (
                                        <img src={flashcards[currentIndex].imageUrl} className="w-full h-full object-cover" alt="hint" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Library className="w-12 h-12 text-slate-200" /></div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 leading-tight">
                                    {flashcards[currentIndex].que}
                                </h3>
                                <p className="mt-8 text-slate-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                                    <RotateCcw className="w-4 h-4" /> Tap to reveal answer
                                </p>
                            </div>

                            {/* Back Side */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-10 text-center text-white">
                                <span className="absolute top-6 left-6 px-4 py-1.5 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest">Answer</span>
                                <div className="max-h-[70%] overflow-y-auto custom-scrollbar pr-2">
                                    <p className="text-2xl font-bold leading-relaxed">
                                        {flashcards[currentIndex].ans}
                                    </p>
                                </div>
                                <p className="mt-8 text-indigo-200 text-sm font-bold animate-pulse">
                                    Tap to return to question
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-8">
                        <button 
                            onClick={prevCard}
                            disabled={currentIndex === 0}
                            className="p-4 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-md hover:shadow-lg active:scale-90"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        
                        <div className="flex gap-2">
                            {flashcards.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}
                                />
                            ))}
                        </div>

                        <button 
                            onClick={nextCard}
                            disabled={currentIndex === flashcards.length - 1}
                            className="p-4 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-md hover:shadow-lg active:scale-90"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .rotate-y-0 { transform: rotateY(0deg); }
            `}</style>
        </div>
    );
};

export default Flashcards;
