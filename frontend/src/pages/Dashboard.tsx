import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
    Video, FileText, Type,
    Brain, Zap, Clock, 
    ArrowRight, Star, Plus, Sparkles,
    Music, ChevronRight, Globe,
    CheckSquare, Library
} from 'lucide-react';
import { useSummary } from '../context/SummaryContext';

const Dashboard = () => {
    const [profile, setProfile] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { setSummary } = useSummary();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, historyRes] = await Promise.all([
                    api.get('/user/getProfile'),
                    api.get('/history/')
                ]);
                
                setProfile(profileRes.data);
                if (historyRes.data?.success) {
                    const sortedAll = (historyRes.data.result || [])
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setHistory(sortedAll.slice(0, 5)); // Just the top 5 for the main view
                    setAllHistory(sortedAll); // Store everything for the full list
                }
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
       <div className="flex flex-col items-center justify-center p-24 space-y-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
           <p className="text-slate-500 font-medium">Preparing your workspace...</p>
       </div>
    );

    // More robust user data extraction
    const user = profile?.user || profile?.data?.user || profile?.data || profile;
    const userCredits = user?.dailyCredits ?? user?.glitter ?? user?.credit ?? 0;

    const quickActions = [
        { title: "Video Summary", icon: <Video className="w-6 h-6" />, desc: "Summarize YouTube videos", path: "/dashboard/video", color: "bg-red-50 text-red-600 hover:bg-red-100/80" },
        { title: "Web Summary", icon: <Globe className="w-6 h-6" />, desc: "Extract insights from any URL", path: "/dashboard/web", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100/80" },
        { title: "File Summary", icon: <FileText className="w-6 h-6" />, desc: "Extract insights from PDF/audio", path: "/dashboard/files", color: "bg-blue-50 text-blue-600 hover:bg-blue-100/80" },
        { title: "Text Analysis", icon: <Type className="w-6 h-6" />, desc: "Analyze and summarize notes", path: "/dashboard/text", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80" },
    ];

    const getHistoryIcon = (item: any) => {
        const name = item.modelName?.toLowerCase() || '';
        const data = item.data?.[0] || {};
        if (name.includes('video') || data.videoId || data.videoUrl) return <Video className="w-5 h-5" />;
        if (name.includes('pdf')) return <FileText className="w-5 h-5" />;
        if (name.includes('audio')) return <Music className="w-5 h-5" />;
        if (name.includes('web') || data.url) return <Globe className="w-5 h-5" />;
        if (name.includes('text') || data.text) return <Type className="w-5 h-5" />;
        if (name.includes('mindmap')) return <Brain className="w-5 h-5" />;
        if (name.includes('quiz')) return <CheckSquare className="w-5 h-5" />;
        if (name.includes('flashcard')) return <Library className="w-5 h-5" />;
        return <Sparkles className="w-5 h-5" />;
    };

    const getHistoryColor = (item: any) => {
        const name = item.modelName?.toLowerCase() || '';
        const data = item.data?.[0] || {};
        if (name.includes('video') || data.videoId || data.videoUrl) return 'bg-red-50 text-red-600';
        if (name.includes('pdf')) return 'bg-blue-50 text-blue-600';
        if (name.includes('audio')) return 'bg-emerald-50 text-emerald-600';
        if (name.includes('web') || data.url) return 'bg-indigo-50 text-indigo-600';
        if (name.includes('text') || data.text) return 'bg-slate-50 text-slate-600';
        if (name.includes('mindmap')) return 'bg-purple-50 text-purple-600';
        if (name.includes('quiz')) return 'bg-indigo-50 text-indigo-600';
        if (name.includes('flashcard')) return 'bg-emerald-50 text-emerald-600';
        return 'bg-slate-50 text-slate-600';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleHistoryClick = (item: any) => {
        const data = item.data?.[0];
        if (!data) return;

        let source = '';
        let path = '';
        let navState: any = null;
        
        const modelName = item.modelName?.toLowerCase() || '';

        if (modelName.includes('video') || data.videoId || data.videoUrl) {
            source = 'video';
            path = '/dashboard/video';
        } else if (modelName.includes('pdf')) {
            source = 'pdf';
            path = '/dashboard/files';
        } else if (modelName.includes('audio')) {
            source = 'audio';
            path = '/dashboard/files';
        } else if (modelName.includes('web') || data.url) {
            source = 'web';
            path = '/dashboard/web';
        } else if (modelName.includes('text') || data.text) {
            source = 'text';
            path = '/dashboard/text';
        } else if (modelName.includes('mindmap')) {
            source = data.source;
            path = '/dashboard/mindmap';
            navState = { summaryId: data.summaryId, source: data.source };
        } else if (modelName.includes('quiz')) {
            source = data.source;
            path = '/dashboard/quiz';
            navState = { summaryId: data.summaryId, source: data.source };
        } else if (modelName.includes('flashcard')) {
            source = data.source;
            path = '/dashboard/flashcards';
            navState = { summaryId: data.summaryId, source: data.source };
        } else {
            console.log("Unhandled history type", item);
            return;
        }

        // For summary types, we set the global context
        if (!modelName.includes('mindmap') && !modelName.includes('quiz') && !modelName.includes('flashcard')) {
            const summaryToSet = {
                ...data,
                title: data.title || data.topic || 'Untitled Summary'
            };
            setSummary(summaryToSet, source as any);
        }

        navigate(path, { state: navState });
    };

    return (
        <div className="space-y-10 pb-12">
            {/* Hero Banner */}
            <header className="relative p-10 rounded-[2.5rem] shadow-xl overflow-hidden text-white group bg-slate-950 border border-slate-800">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 space-y-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 backdrop-blur-md rounded-full w-fit border border-indigo-500/30 text-xs font-semibold tracking-wider uppercase text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Premium AI Workspace
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400">
                        Welcome back, {user?.firstName || user?.username || 'Innovator'}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                        Ready to accelerate your productivity? Transform any content into knowledge with our advanced AI engine.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4">
                        <button 
                            onClick={() => navigate('/video')} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                        >
                            <Plus className="w-5 h-5" /> Create New Project
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard/pricing')} 
                            className="bg-slate-800/50 hover:bg-slate-800 text-slate-200 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border border-slate-700 backdrop-blur-md"
                        >
                            View Upgrade Plans
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics & Credits */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-6 group-hover:rotate-12 transition-transform duration-300">
                                <Zap className="w-8 h-8 fill-indigo-600" />
                            </div>
                            <h3 className="text-slate-500 font-bold text-sm tracking-wider uppercase mb-1">Available Credits</h3>
                            <p className="text-5xl font-extrabold text-slate-800 tracking-tighter mb-4">
                                {userCredits}
                            </p>
                            <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.5)]" style={{ width: `${Math.min((userCredits / 10) * 100, 100)}%` }}></div>
                            </div>
                            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition duration-300">
                                Top Up Balance
                            </button>
                        </div>
                    </section>
                    
                    <section 
                        onClick={() => navigate('/dashboard/pricing')}
                        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-indigo-900/40 text-white group cursor-pointer relative overflow-hidden transition-all hover:shadow-indigo-500/20 hover:-translate-y-1 border border-indigo-500/20"
                    >
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/30 rounded-full blur-[40px] group-hover:bg-indigo-400/40 transition-all duration-500"></div>
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-500/20 rounded-full blur-[30px] group-hover:bg-purple-400/30 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <Star className="w-8 h-8 mb-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                            <h3 className="text-xl font-extrabold mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">Lifetime Premium</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-5 font-medium">Unlock unlimited exports, advanced AI models & exclusive features.</p>
                            <div className="flex items-center gap-2 text-sm font-bold bg-indigo-500/20 text-indigo-200 w-fit px-4 py-2 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500/30 group-hover:border-indigo-400/50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                Upgrade Now <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                            <Plus className="w-6 h-6 text-indigo-600" /> Quick Smart Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map((action, i) => (
                                <button 
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    className={`p-6 rounded-[1.8rem] flex items-center gap-5 transition-all duration-300 transform hover:-translate-y-1 text-left border border-transparent shadow-sm hover:shadow-xl hover:border-indigo-100 ${action.color} bg-white shadow-slate-200/60 group`}
                                >
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-50 group-hover:scale-110 transition-transform duration-300">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{action.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium">{action.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-indigo-500" /> {showFullHistory ? "Complete Activity History" : "Recent Activity"}
                            </h2>
                            <button 
                                onClick={() => setShowFullHistory(!showFullHistory)}
                                className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1 px-4 py-2 bg-indigo-50 rounded-xl transition-all hover:bg-indigo-100"
                            >
                                {showFullHistory ? "Show Recent" : "See All History"}
                            </button>
                        </div>
                        
                        {(showFullHistory ? allHistory : history).length > 0 ? (
                            <div className={`space-y-3 ${showFullHistory ? 'max-h-[600px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                                {(showFullHistory ? allHistory : history).map((item, idx) => {
                                    const data = item.data?.[0];
                                    if (!data) return null;
                                    return (
                                        <div 
                                            key={idx}
                                            onClick={() => handleHistoryClick(item)}
                                            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${getHistoryColor(item)}`}>
                                                    {getHistoryIcon(item)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1 max-w-[200px] md:max-w-xs uppercase tracking-tight">
                                                        {data.title || 'Untitled Summary'}
                                                    </h4>
                                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{formatDate(item.createdAt)}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                <div className="p-6 bg-slate-50 rounded-full mb-6">
                                    <Brain className="w-12 h-12 opacity-30" />
                                </div>
                                <p className="font-bold text-slate-500">No activity yet</p>
                                <p className="text-sm">Start by summarizing your first video or document!</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
