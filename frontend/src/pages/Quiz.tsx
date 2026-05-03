import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckSquare, AlertCircle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import api from '../api';

const Quiz = () => {
    const location = useLocation();
    const { summaryId, source } = (location.state as any) || {};

    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        if (summaryId && source) {
            handleGenerateQuiz();
        }
    }, [summaryId, source]);

    const handleGenerateQuiz = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/quiz/', { summaryId, source });
            if (res.data && res.data.result) {
                setQuizzes(res.data.result);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate quiz. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option: string) => {
        if (selectedOption || showResult) return;
        setSelectedOption(option);
        
        const currentQuiz = quizzes[currentIndex];
        if (option === currentQuiz.correctOption) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < quizzes.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    if (!summaryId || !source) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckSquare className="w-8 h-8 text-indigo-500" />
                        AI Quizzes
                    </h1>
                    <p className="text-slate-500 mt-2">Generate quizzes based on your summaries to test your knowledge.</p>
                </div>
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <CheckSquare className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">No Content Selected</h2>
                    <p className="text-slate-500 mt-2 max-w-md">
                        Please generate a summary first, then click on the "Quizzes" action to create questions for that content.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckSquare className="w-8 h-8 text-indigo-500" />
                        AI Quiz
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Verify your understanding of the summary.</p>
                </div>
                {quizzes.length > 0 && !showResult && (
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm">
                        Q {currentIndex + 1} / {quizzes.length}
                    </div>
                )}
            </header>

            {loading && (
                <div className="bg-white p-20 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Generating your custom quiz...</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex flex-col items-center gap-4 text-center border border-red-100">
                    <AlertCircle className="w-12 h-12" />
                    <div>
                        <h3 className="font-bold text-lg">Failed to Generate</h3>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                    <button 
                        onClick={handleGenerateQuiz}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {quizzes.length > 0 && !showResult && !loading && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-2xl font-black text-slate-800 mb-8 leading-tight">
                            {quizzes[currentIndex].que}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {['A', 'B', 'C', 'D'].map((key) => {
                                const optionText = quizzes[currentIndex].options[key];
                                const isSelected = selectedOption === key;
                                const isCorrect = quizzes[currentIndex].correctOption === key;
                                
                                let stateClasses = 'bg-slate-50 border-slate-100 hover:border-indigo-600 hover:bg-white text-slate-700';
                                if (selectedOption) {
                                    if (isCorrect) stateClasses = 'bg-emerald-50 border-emerald-500 text-emerald-700';
                                    else if (isSelected) stateClasses = 'bg-red-50 border-red-500 text-red-700';
                                    else stateClasses = 'bg-slate-50 border-slate-100 opacity-50';
                                }

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleAnswer(key)}
                                        disabled={!!selectedOption}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all font-bold text-left ${stateClasses}`}
                                    >
                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 ${isSelected ? 'bg-current text-white border-transparent' : 'bg-white border-slate-200'}`}>
                                            {key}
                                        </span>
                                        <span className="flex-1">{optionText}</span>
                                        {selectedOption && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                        {selectedOption && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {showResult && (
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col items-center text-center">
                    <div className={`p-6 rounded-full mb-6 ${score === quizzes.length ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                        <CheckCircle2 className="w-16 h-16" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">Quiz Completed!</h2>
                    <p className="text-slate-500 font-bold text-lg mb-8">You mastered the content with a score of:</p>
                    
                    <div className="text-7xl font-black text-indigo-600 mb-10 tracking-tighter">
                        {score} <span className="text-slate-200">/</span> {quizzes.length}
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3"
                    >
                        Retake Quiz <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
