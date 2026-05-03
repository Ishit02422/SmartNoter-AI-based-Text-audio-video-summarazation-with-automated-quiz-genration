import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Brain, AlertCircle, ChevronDown, ChevronRight, Share2 } from 'lucide-react';
import api from '../api';

const Mindmap = () => {
    const location = useLocation();
    const { summaryId, source } = (location.state as any) || {};

    const [mindmap, setMindmap] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));

    useEffect(() => {
        if (summaryId && source) {
            fetchOrGenerateMindmap();
        }
    }, [summaryId, source]);

    const fetchOrGenerateMindmap = async () => {
        setLoading(true);
        setError('');
        try {
            // First try to fetch existing mindmap
            const fetchRes = await api.post('/mindMap/getMindMap', { summaryId, source });
            if (fetchRes.data && fetchRes.data.result) {
                setMindmap(fetchRes.data.result);
                setLoading(false);
                return;
            }
        } catch (fetchErr: any) {
            // Only proceed to generate if it's not found (404)
            if (fetchErr.response?.status !== 404) {
                setError(fetchErr.response?.data?.message || 'Failed to fetch mindmap. Try again.');
                setLoading(false);
                return;
            }
        }

        // If not found, generate a new one
        try {
            const genRes = await api.post('/mindMap/', { summaryId, source });
            if (genRes.data && genRes.data.result) {
                setMindmap(genRes.data.result);
            }
        } catch (genErr: any) {
            setError(genErr.response?.data?.message || 'Failed to generate mindmap. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMindmap = () => {
        fetchOrGenerateMindmap();
    };

    const toggleTopic = (index: number) => {
        const newSet = new Set(expandedTopics);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setExpandedTopics(newSet);
    };

    if (!summaryId || !source) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        Mindmaps
                    </h1>
                    <p className="text-slate-500 mt-2">Visually map out concepts from your generated summaries.</p>
                </div>
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Brain className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">No Context Provided</h2>
                    <p className="text-slate-500 mt-2 max-w-md">
                        Generate a summary first, then click "Mindmap" to see a visual breakdown of the topics.
                    </p>
                </div>
            </div>
        );
    }

    const [copied, setCopied] = useState(false);

    const handleExport = () => {
        if (!mindmap) return;
        
        let exportText = `Mindmap: ${mindmap.title}\n\n`;
        
        mindmap.topics.forEach((topic: any, idx: number) => {
            exportText += `${idx + 1}. ${topic.topic}\n`;
            topic.subtopics.forEach((sub: any) => {
                exportText += `   - ${sub.subTopic}: ${sub.detail}\n`;
            });
            exportText += '\n';
        });

        navigator.clipboard.writeText(exportText.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
             <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        Mindmap Explorer
                    </h1>
                    <p className="text-slate-500 mt-2">Structured visual breakdown of your content.</p>
                </div>
                {mindmap && (
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                    >
                        {copied ? (
                            <>
                                <span className="text-green-600 flex items-center gap-2">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4" /> Export Map
                            </>
                        )}
                    </button>
                )}
            </header>

            {loading && (
                <div className="bg-white p-20 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-slate-500 font-bold">Mapping out concepts...</p>
                </div>
            )}

            {error && (
                <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                    <div>
                        <h3 className="text-lg font-bold text-amber-900">Visualization Failed</h3>
                        <p className="text-amber-800/70">{error}</p>
                    </div>
                    <button onClick={handleGenerateMindmap} className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold">Retry Generation</button>
                </div>
            )}

            {mindmap && (
                <div className="space-y-6">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                        <span className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2 block">Central Theme</span>
                        <h2 className="text-4xl font-black">{mindmap.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mindmap.topics.map((topic: any, idx: number) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button 
                                    onClick={() => toggleTopic(idx)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                            {idx + 1}
                                        </div>
                                        <h3 className="font-black text-xl text-slate-800">{topic.topic}</h3>
                                    </div>
                                    {expandedTopics.has(idx) ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
                                </button>
                                
                                {expandedTopics.has(idx) && (
                                    <div className="p-6 pt-0 space-y-4">
                                        {topic.subtopics.map((sub: any, sIdx: number) => (
                                            <div key={sIdx} className="pl-14 relative">
                                                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                                                <div className="absolute left-7 top-3 w-4 h-0.5 bg-slate-100"></div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <h4 className="font-bold text-slate-800 mb-1">{sub.subTopic}</h4>
                                                    <p className="text-slate-500 text-sm leading-relaxed">{sub.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mindmap;
