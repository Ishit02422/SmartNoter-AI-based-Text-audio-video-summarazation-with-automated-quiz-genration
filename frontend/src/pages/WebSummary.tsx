import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Globe, Search, AlertCircle, FileText, Copy, Check, Trash2, ExternalLink, Sparkles, Volume2, VolumeX, Pause, Play, Download } from 'lucide-react';
import api from '../api';
import AIActions from '../components/AIActions';
import { useSummary } from '../context/SummaryContext';

const WebSummary = () => {
    const { lastSummary: summary, lastSource, setSummary: setGlobalSummary, clearSummary } = useSummary();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Audio reader state
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const isOurSource = lastSource === 'web';

    // Clean up SpeechSynthesis when switching pages
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault();
        if (!url.startsWith('http')) {
            setError('Please enter a valid URL (e.g. https://example.com)');
            return;
        }

        setLoading(true);
        setError('');
        clearSummary();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);

        try {
            const res = await api.post('/generatedSummaryWeb/direct', {
                url: url
            });

            if (res.data && res.data.result) {
                const apiResult = res.data.result;
                // Map backend fields to frontend SummaryResult format
                const mappedResult = {
                    ...apiResult,
                    title: apiResult.title || apiResult.topic || 'Web Page Summary',
                    url: apiResult.url || url,
                };
                setGlobalSummary(mappedResult, 'web');
            } else {
                setError('Unexpected response from server. Please try again.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response) {
                const status = err.response.status;
                const msg = err.response.data?.message || '';

                if (status === 401) {
                    setError('You need to be logged in. Please login first.');
                } else if (status === 403 || status === 402) {
                    setError('Premium subscription or credits required for this feature.');
                } else if (status === 422) {
                    setError('Invalid input: ' + msg);
                } else {
                    setError(msg || 'Failed to generate web summary. Please try again.');
                }
            } else if (err.request) {
                setError('Backend server is not responding. Make sure the server is running.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setUrl('');
        clearSummary();
        setError('');
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const handleCopyAll = () => {
        if (!summary) return;
        let fullText = `Title: ${summary.title}\nSource: ${summary.url || (summary as any).url || ''}\n\n`;
        fullText += `Summary:\n${summary.summarization}\n\n`;
        if (summary.keyPoints && summary.keyPoints.length > 0) {
            fullText += `Key Points:\n- ${summary.keyPoints.join('\n- ')}\n\n`;
        }
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Text to Speech logic
    const handleSpeech = () => {
        if (!summary?.summarization) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(summary.summarization);
        utterance.lang = 'en-US';

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handlePauseSpeech = () => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        } else {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    // File download exports
    const handleDownloadTxt = () => {
        if (!summary) return;
        let text = `TITLE: ${summary.title}\nSOURCE: ${summary.url || (summary as any).url || ''}\n\nEXECUTIVE SUMMARY:\n${summary.summarization}\n\n`;
        if (summary.keyPoints && summary.keyPoints.length > 0) {
            text += `KEY POINTS:\n- ${summary.keyPoints.join('\n- ')}\n\n`;
        }
        text += `Generated with SmartNoter AI`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
    };

    const handleDownloadMd = () => {
        if (!summary) return;
        let text = `# ${summary.title}\n\n**Source:** [${summary.url || (summary as any).url || 'Web Link'}](${summary.url || (summary as any).url || ''})\n\n## Executive Summary\n${summary.summarization}\n\n`;
        if (summary.keyPoints && summary.keyPoints.length > 0) {
            text += `## Key Points\n- ${summary.keyPoints.join('\n- ')}\n\n`;
        }
        text += `*Generated with SmartNoter AI*`;
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Globe className="w-8 h-8 text-indigo-600" />
                        Web Page Summary
                    </h1>
                    <p className="text-slate-500 mt-2">Paste any website link below to generate a concise AI summary of the content.</p>
                </div>
            </div>

            <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1 text-sm font-medium text-slate-700">
                    <label>Website URL</label>
                    {url && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition text-xs"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>

                <div className="flex gap-4 items-start w-full">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/article-to-summarize"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition"
                                required
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? 'Analyzing...' : 'Summarize'}
                    </button>
                </div>
            </form>

            {loading && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="font-medium">Fetching and analyzing content...</p>
                    <p className="text-sm text-slate-400 mt-1">This might take a minute depending on the page size.</p>
                </div>
            )}

            {isOurSource && summary && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-500" />
                                {summary.title || 'Untitled Web Page'}
                            </h2>
                            <a 
                                href={summary.url || (summary as any).url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-1 truncate max-w-sm"
                            >
                                <ExternalLink className="w-3 h-3" /> {summary.url || (summary as any).url}
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* TTS Button */}
                            <button
                                onClick={handleSpeech}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
                                    isSpeaking 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                                title={isSpeaking ? 'Stop Listening' : 'Listen'}
                            >
                                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                {isSpeaking ? 'Stop' : 'Listen'}
                            </button>

                            {isSpeaking && (
                                <button
                                    onClick={handlePauseSpeech}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                                    title={isPaused ? 'Resume' : 'Pause'}
                                >
                                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                                    {isPaused ? 'Resume' : 'Pause'}
                                </button>
                            )}

                            {/* Copy Button */}
                            <button
                                onClick={handleCopyAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition bg-white"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>

                            {/* Export TXT */}
                            <button
                                onClick={handleDownloadTxt}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition bg-white"
                                title="Export TXT"
                            >
                                <Download className="w-4 h-4" />
                                <span>TXT</span>
                            </button>

                            {/* Export MD */}
                            <button
                                onClick={handleDownloadMd}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition bg-white"
                                title="Export MD"
                            >
                                <Download className="w-4 h-4" />
                                <span>MD</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" /> Summary
                        </h3>
                        <div className="whitespace-pre-wrap text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl text-sm border border-slate-100">
                            {summary.summarization || 'Summary could not be generated.'}
                        </div>
                    </div>

                    {summary.keyPoints && (summary as any).keyPoints.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-700">Key Points</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                                {(summary as any).keyPoints.map((point: string, i: number) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <AIActions summaryId={summary._id} source="web" />
                </div>
            )}
        </div>
    );
};

export default WebSummary;
