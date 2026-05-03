import { useState } from 'react';
import type { FormEvent } from 'react';
import { Type, FileText, AlertCircle, Copy, Check, Trash2, Zap } from 'lucide-react';
import api from '../api';
import AIActions from '../components/AIActions';
import { useSummary } from '../context/SummaryContext';



const translations: Record<string, any> = {
    en: {
        title: "Text Summarization",
        subtitle: "Paste your content below and let AI extract key insights, actionable points, and a professional summary in seconds.",
        placeholder: "Paste or type your content here (min. 50 characters)...",
        actionBtn: "Generate Summary",
        generating: "AI is analyzing...",
        executiveSummary: "Executive Summary",
        keyPoints: "Key Insights",
        actionPoints: "Actionable Steps",
        copyAll: "Copy All",
        copied: "Copied!",
        errorMinLength: "Please enter at least 50 characters for a meaningful summary.",
        errorGeneral: "Something went wrong. Please try again.",
        historyTitle: "Recent Summaries",
        noHistory: "No summaries yet. Start by pasting some text above!"
    },
    gu: {
        title: "લખાણનો સારાંશ",
        subtitle: "તમારું લખાણ અહીં પેસ્ટ કરો અને AI ને સેકન્ડોમાં મુખ્ય મુદ્દાઓ અને પ્રોફેશનલ સારાંશ કાઢવા દો.",
        placeholder: "તમારું લખાણ અહીં પેસ્ટ કરો (ઓછામાં ઓછા ૫૦ અક્ષર)...",
        actionBtn: "સારાંશ બનાવો",
        generating: "AI વિશ્લેષણ કરી રહ્યું છે...",
        executiveSummary: "મુખ્ય સારાંશ",
        keyPoints: "મહત્વના મુદ્દાઓ",
        actionPoints: "કરવા યોગ્ય પગલાં",
        copyAll: "બધું કોપી કરો",
        copied: "કોપી થઈ ગયું!",
        errorMinLength: "અર્થપૂર્ણ સારાંશ માટે કૃપા કરીને ઓછામાં ઓછા ૫૦ અક્ષરો દાખલ કરો.",
        errorGeneral: "કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.",
        historyTitle: "તાજેતરના સારાંશ",
        noHistory: "હજી સુધી કોઈ સારાંશ નથી. ઉપર લખાણ પેસ્ટ કરીને શરૂઆત કરો!"
    },
    hi: {
        title: "लेख सारांश",
        subtitle: "अपनी सामग्री नीचे पेस्ट करें और AI को सेकंडोंમાં महत्वपूर्ण अंतर्दृष्टि અને पेशेवर सारांश निकालने दें।",
        placeholder: "अपनी सामग्री यहाँ पेस्ट करें (न्यूनतम 50 अक्षर)...",
        actionBtn: "सारांश तैयार करें",
        generating: "AI विश्लेषण कर रहा है...",
        executiveSummary: "मुख्य सारांश",
        keyPoints: "महत्वपूर्ण बिंदु",
        actionPoints: "कार्यवाही योग्य कदम",
        copyAll: "सभी कॉपी करें",
        copied: "कॉपी किया गया!",
        errorMinLength: "सार्थक सारांश के लिए कृपया कम से कम 50 अक्षर दर्ज करें.",
        errorGeneral: "कुछ गलत हो गया. कृपया पुनः प्रयास करें.",
        historyTitle: "हाल के सारांश",
        noHistory: "अभी तक कोई सारांश नहीं है. ऊपर टेक्स्ट पेस्ट करके शुरू करें!"
    }
};

const TextSummary = () => {
    const { lastSummary: summary, lastSource, setSummary: setGlobalSummary, clearSummary } = useSummary();
    const [text, setText] = useState('');
    const [language, setLanguage] = useState<'en' | 'gu' | 'hi'>('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const isOurSource = lastSource === 'text';

    const t = (key: string) => translations[language][key] || key;

    const handleCopyAll = () => {
        if (!summary) return;
        const fullContent = `${summary.title}\n\n${t('executiveSummary')}:\n${summary.summarization}\n\n${t('keyPoints')}:\n${summary.keyPoints?.join('\n')}\n\n${t('actionPoints')}:\n${summary.actionPoints?.join('\n')}`;
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (text.length < 50) {
            setError(t('errorMinLength'));
            return;
        }

        setLoading(true);
        setError('');
        clearSummary();
        try {
            const res = await api.post('/generateSummaryText/direct', { 
                text, 
                language
            });
            setGlobalSummary(res.data.result, 'text');
        } catch (err: any) {
            setError(err.response?.data?.message || t('errorGeneral'));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setText('');
        clearSummary();
        setError('');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                            <Type className="w-8 h-8 text-white" />
                        </div>
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 self-start">
                    {(['en', 'gu', 'hi'] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                language === lang 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {lang === 'en' ? 'English' : lang === 'gu' ? 'ગુજરાતી' : 'हिंदी'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="relative p-4">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('placeholder')}
                            className="w-full h-64 p-6 text-slate-700 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all outline-none resize-none text-lg leading-relaxed placeholder:text-slate-300"
                        />
                        {text && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute top-8 right-8 p-2 bg-white text-slate-400 hover:text-red-500 rounded-xl shadow-sm border border-slate-100 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    <div className="px-6 pb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {error && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-shake">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold">{error}</span>
                                </div>
                            )}
                            {!error && text.length > 0 && (
                                <span className="text-xs font-bold text-slate-400">
                                    {text.length} characters
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || text.length < 50}
                            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl font-black transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 disabled:hover:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('generating')}
                                </>
                            ) : (
                                <>
                                    {t('actionBtn')}
                                    <Type className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Result Section */}
            {isOurSource && summary && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 space-y-10 animate-fade-in-up">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-8">
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                            <FileText className="w-8 h-8 text-indigo-500" />
                            {summary.title || t('executiveSummary')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyAll}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all font-bold text-sm border border-slate-100 hover:border-indigo-100"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? t('copied') : t('copyAll')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                        {summary.summarization && (
                            <section className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-indigo-100"></span>
                                    {t('executiveSummary')}
                                </h3>
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                                    <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                                        "{summary.summarization}"
                                    </p>
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {summary.keyPoints && summary.keyPoints.length > 0 && (
                                <section className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-8 h-[2px] bg-blue-100"></span>
                                        {t('keyPoints')}
                                    </h3>
                                    <div className="space-y-4">
                                        {summary.keyPoints.map((point: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 group hover:bg-blue-50 transition-colors">
                                                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-xl shadow-sm text-blue-600 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-700 font-bold leading-relaxed">{point}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {summary.actionPoints && summary.actionPoints.length > 0 && (
                                <section className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-8 h-[2px] bg-emerald-100"></span>
                                        {t('actionPoints')}
                                    </h3>
                                    <div className="space-y-4">
                                        {summary.actionPoints.map((point: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group hover:bg-emerald-50 transition-colors">
                                                <div className="flex-shrink-0">
                                                    <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                                                </div>
                                                <p className="text-slate-700 font-bold leading-relaxed">{point}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* AI Engagement Options */}
                    <AIActions summaryId={summary._id} source="text" />
                </div>
            )}
        </div>
    );
};

export default TextSummary;
