import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Youtube, Search, AlertCircle, FileText, Copy, Check, Trash2, Volume2, VolumeX, Pause, Play, Download } from 'lucide-react';
import api from '../api';
import AIActions from '../components/AIActions';
import { useSummary } from '../context/SummaryContext';

const translations: Record<string, any> = {
    en: {
        title: "YouTube Video Summary",
        executiveSummary: "Executive Summary",
        description: "Paste a YouTube link below to generate a concise AI summary of the video content.",
        urlLabel: "Video URL",
        placeholder: "https://www.youtube.com/watch?v=...",
        summarize: "Summarize",
        generating: "Generating...",
        analyzing: "Analyzing video...",
        mightTakeTime: "Downloading transcript and summarizing. This might take a minute.",
        clear: "Clear",
        copy: "Copy",
        copied: "Copied!",
        noSummary: "Summary could not be generated.",
        listen: "Listen",
        stop: "Stop",
        pause: "Pause",
        resume: "Resume",
        downloadTxt: "Export TXT",
        downloadMd: "Export MD",
    },
    hi: {
        title: "यूट्यूब वीडियो सारांश",
        executiveSummary: "कार्यकारी सारांश",
        description: "वीडियो सामग्री का संक्षिप्त एआई सारांश तैयार करने के लिए नीचे एक यूट्यूब लिंक पेस्ट करें।",
        urlLabel: "वीडियो यूआरएल",
        placeholder: "https://www.youtube.com/watch?v=...",
        summarize: "सारांश तैयार करें",
        generating: "तैयार किया जा रहा है...",
        analyzing: "वीडियो का विश्लेषण हो रहा है...",
        mightTakeTime: "ट्रांसक्रिप्ट डाउनलोड हो रही है और सारांश तैयार किया जा रहा है। इसमें एक मिनट लग सकता है।",
        clear: "साफ़ करें",
        copy: "कॉपी",
        copied: "कॉपी हो गया!",
        noSummary: "सारांश तैयार नहीं किया जा सका।",
        listen: "सुनें",
        stop: "रोकें",
        pause: "विराम",
        resume: "फिर शुरू करें",
        downloadTxt: "TXT डाउनलोड",
        downloadMd: "MD डाउनलोड",
    },
    gu: {
        title: "YouTube વિડિઓ સારાંશ",
        executiveSummary: "કાર્યકારી સારાંશ",
        description: "વિડિઓ સામગ્રીનો સંક્ષિપ્ત AI સારાંશ જનરેટ કરવા માટે નીચે YouTube લિંક પેસ્ટ કરો.",
        urlLabel: "વિડિઓ URL",
        placeholder: "https://www.youtube.com/watch?v=...",
        summarize: "સારાંશ તૈયાર કરો",
        generating: "તમેળવો...",
        analyzing: "વિડિઓનું વિશ્લેષણ થઈ રહ્યું છે...",
        mightTakeTime: "ટ્રાન્સક્રિપ્ટ ડાઉનલોડ થઈ રહી છે અને સારાંશ તૈયાર થઈ રહ્યો છે. આમાં એક મિનિટ લાગી શકે છે.",
        clear: "સાફ કરો",
        copy: "કોપી",
        copied: "કોપી થઈ ગઈ!",
        noSummary: "સારાંશ તૈયાર કરી શકાયો નથી.",
        listen: "સાંભળો",
        stop: "બંધ કરો",
        pause: "અટકાવો",
        resume: "ચાલુ કરો",
        downloadTxt: "TXT ડાઉનલોડ",
        downloadMd: "MD ડાઉનલોડ",
    },
    es: {
        title: "Resumen de Video de YouTube",
        executiveSummary: "Resumen Ejecutivo",
        description: "Pega un enlace de YouTube a continuación para generar un resumen conciso de IA del contenido del video.",
        urlLabel: "URL del video",
        placeholder: "https://www.youtube.com/watch?v=...",
        summarize: "Resumir",
        generating: "Generando...",
        analyzing: "Analizando video...",
        mightTakeTime: "Descargando transcripción y resumiendo. Esto puede tardar un minuto.",
        clear: "Limpiar",
        copy: "Copiar",
        copied: "¡Copiado!",
        noSummary: "No se pudo generar el resumen.",
        listen: "Escuchar",
        stop: "Detener",
        pause: "Pausar",
        resume: "Reanudar",
        downloadTxt: "Exportar TXT",
        downloadMd: "Exportar MD",
    },
    fr: {
        title: "Résumé de Vidéo YouTube",
        executiveSummary: "Résumé Exécutif",
        description: "Collez un lien YouTube ci-dessous para générer un résumé IA concis du contenu de la vidéo.",
        urlLabel: "URL de la vidéo",
        placeholder: "https://www.youtube.com/watch?v=...",
        summarize: "Résumer",
        generating: "Génération...",
        analyzing: "Analyse de la vidéo...",
        mightTakeTime: "Téléchargement de la transcription et résumé en cours. Cela peut prendre une minute.",
        clear: "Effacer",
        copy: "Copier",
        copied: "Copié !",
        noSummary: "Le résumé n'a pas pu être généré.",
        listen: "Écouter",
        stop: "Arrêter",
        pause: "Pause",
        resume: "Reprendre",
        downloadTxt: "Exporter TXT",
        downloadMd: "Exporter MD",
    }
};

const VideoSummary = () => {
    const { lastSummary: summary, lastSource, setSummary: setGlobalSummary, clearSummary } = useSummary();
    const [url, setUrl] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Audio reader state
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const isOurSource = lastSource === 'video';
    const t = (key: string) => translations[language]?.[key] || translations.en[key];

    // Clean up SpeechSynthesis when switching pages
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const extractVideoIdFromUrl = (videoUrl: string): string | null => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = videoUrl.match(regex);
        return match ? match[1] : null;
    };

    const activeVideoId = (summary as any)?.videoId || ((summary as any)?.videoUrl ? extractVideoIdFromUrl((summary as any).videoUrl) : null) || extractVideoIdFromUrl(url);

    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault();
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            setError('Please enter a valid YouTube URL (e.g. youtube.com/watch?v=...)');
            return;
        }

        setLoading(true);
        setError('');
        clearSummary();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);

        try {
            const res = await api.post('/generatedSummaryFromVideo/youtube/direct', {
                videoUrl: url,
                language: language,
                summary_models: "informative",
                summary_types: "paragraph"
            });

            if (res.data && res.data.result) {
                setGlobalSummary(res.data.result, 'video');
            } else {
                setError('Unexpected response from server. Please try again.');
            }
        } catch (err: any) {
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
                    setError(msg || 'Failed to generate video summary. Please try again.');
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
        let fullText = `Title: ${summary.title}\n\n`;
        fullText += `Summary:\n${summary.summarization}\n\n`;
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
        
        // Match language voice
        const langMap: Record<string, string> = {
            en: 'en-US',
            hi: 'hi-IN',
            gu: 'gu-IN',
            es: 'es-ES',
            fr: 'fr-FR'
        };
        utterance.lang = langMap[language] || 'en-US';

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
        const text = `TITLE: ${summary.title}\n\nEXECUTIVE SUMMARY:\n${summary.summarization}\n\nGenerated with SmartNoter AI`;
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
        const text = `# ${summary.title}\n\n## Executive Summary\n${summary.summarization}\n\n*Generated with SmartNoter AI*`;
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <Youtube className="w-8 h-8 text-red-500" />
                    {t('title')}
                </h1>
                <p className="text-slate-500 mt-2">{t('description')}</p>
            </div>

            <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1 text-sm font-medium text-slate-700">
                    <label>{t('urlLabel')}</label>
                    <div className="flex gap-4 items-center">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="gu">Gujarati</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                        {url && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition text-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> {t('clear')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 items-start w-full">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder={t('placeholder')}
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
                        {loading ? t('generating') : t('summarize')}
                    </button>
                </div>
            </form>

            {loading && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                    <p className="font-medium">{t('analyzing')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('mightTakeTime')}</p>
                </div>
            )}

            {isOurSource && summary && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Embedded YouTube Video Player */}
                    {activeVideoId && (
                        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Youtube className="w-5 h-5 text-red-500" />
                                Video Player
                            </h3>
                            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-slate-900 border border-slate-100">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${activeVideoId}`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* Right Column: AI Summary & Actions */}
                    <div className={`${activeVideoId ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                {summary.title || t('title')}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {/* TTS Button */}
                                <button
                                    onClick={handleSpeech}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
                                        isSpeaking 
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                    title={isSpeaking ? t('stop') : t('listen')}
                                >
                                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    {isSpeaking ? t('stop') : t('listen')}
                                </button>

                                {isSpeaking && (
                                    <button
                                        onClick={handlePauseSpeech}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                                        title={isPaused ? t('resume') : t('pause')}
                                    >
                                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                                        {isPaused ? t('resume') : t('pause')}
                                    </button>
                                )}

                                {/* Copy Button */}
                                <button
                                    onClick={handleCopyAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition bg-white"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? t('copied') : t('copy')}
                                </button>

                                {/* Export TXT Button */}
                                <button
                                    onClick={handleDownloadTxt}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition bg-white"
                                    title={t('downloadTxt')}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>TXT</span>
                                </button>

                                {/* Export MD Button */}
                                <button
                                    onClick={handleDownloadMd}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition bg-white"
                                    title={t('downloadMd')}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>MD</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-400" /> {t('executiveSummary')}
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl text-sm border border-slate-100">
                                {summary.summarization || t('noSummary')}
                            </div>
                        </div>

                        {/* AI Engagement Options */}
                        <AIActions summaryId={summary._id} source="video" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoSummary;
