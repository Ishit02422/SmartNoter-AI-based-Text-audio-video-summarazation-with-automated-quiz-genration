import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, Video, FileText, CheckSquare, Brain, 
    MessageSquare, Type, LogOut, ChevronRight, Menu, User, Library, Globe, CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, [location.pathname]); // Re-check on navigation

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const navItems = [
        { path: "/dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
        { path: "/dashboard/video", icon: <Video className="w-5 h-5" />, label: "Video Summary" },
        { path: "/dashboard/files", icon: <FileText className="w-5 h-5" />, label: "File Summary" },
        { path: "/dashboard/web", icon: <Globe className="w-5 h-5" />, label: "Web Summary" },
        { path: "/dashboard/text", icon: <Type className="w-5 h-5" />, label: "Text Summary" },
        { path: "/dashboard/quiz", icon: <CheckSquare className="w-5 h-5" />, label: "Quizzes" },
        { path: "/dashboard/mindmap", icon: <Brain className="w-5 h-5" />, label: "Mindmaps" },
        { path: "/dashboard/flashcards", icon: <Library className="w-5 h-5" />, label: "Flashcards" },
        { path: "/dashboard/chat", icon: <MessageSquare className="w-5 h-5" />, label: "Chat with AI" },
        { path: "/dashboard/pricing", icon: <CreditCard className="w-5 h-5" />, label: "Upgrade Plan" },
        { path: "/dashboard/profile", icon: <User className="w-5 h-5" />, label: "My Profile" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-extrabold text-xl text-white tracking-tight">SmartNoter</span>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4 custom-scrollbar">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive(item.path) 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'hover:bg-slate-800/50 hover:text-white'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                                    {item.icon}
                                </span> 
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            {isActive(item.path) && <ChevronRight className="w-4 h-4 text-white/60" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    {token ? (
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-slate-800/50 text-slate-300 rounded-xl font-medium hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" /> 
                            <span className="text-sm">Logout</span>
                        </button>
                    ) : (
                        <Link 
                            to="/login" 
                            className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b flex items-center px-4 lg:px-8 justify-between lg:justify-end sticky top-0 z-30">
                    <button 
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/dashboard/profile"
                            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 hover:scale-110 transition-all font-bold text-sm ring-4 ring-white overflow-hidden shadow-md relative"
                        >
                            {typeof user?.profileImage === 'string' ? (
                                <img 
                                    src={user.profileImage} 
                                    className="w-full h-full object-cover relative z-10" 
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            ) : (user?.profileImage?.imageURL || user?.profileImage?.url) ? (
                                <img 
                                    src={user.profileImage?.imageURL || user.profileImage?.url} 
                                    className="w-full h-full object-cover relative z-10" 
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            ) : null}
                            <User className="w-5 h-5 absolute inset-0 m-auto" />
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-10 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
