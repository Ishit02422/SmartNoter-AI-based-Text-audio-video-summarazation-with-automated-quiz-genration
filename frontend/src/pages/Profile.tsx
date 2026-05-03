import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
    User, Mail, Camera, Save, Trash2, 
    LogOut, Shield, AlertCircle, CheckCircle2, 
    X, Calendar, Zap, Clock, Phone, MapPin, Info
} from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        location: '',
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const getImageUrl = (imgData: any) => {
        if (!imgData) return null;
        if (typeof imgData === 'string') {
            // If it's a URL already
            if (imgData.startsWith('http') || imgData.startsWith('data:') || imgData.includes('/')) {
                return imgData;
            }
            return null; // It's likely just an ID
        }
        return imgData.imageURL || imgData.url || null;
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/getProfile');
            setProfile(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            setFormData({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                phone: res.data.phone || '',
                bio: res.data.bio || '',
                location: res.data.location || '',
            });
        } catch (error) {
            console.error('Failed to load profile', error);
            setError('Failed to load profile information');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.patch('/user/', formData);
            setSuccess('Profile updated successfully!');
            await fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        setError('');
        setSuccess('');

        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('title', 'Profile Picture');
        formDataFile.append('description', 'User profile picture');

        try {
            const imageRes = await api.post('/image/', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageId = imageRes.data._id;
            const res = await api.patch('/user/', { profileImage: imageId });
            const updatedUser = res.data;
            
            setProfile(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setSuccess('Profile picture updated!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload photo');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete(`/user/${profile._id}`);
            handleLogout();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account');
            setShowDeleteModal(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Premium Header */}
            <header className="relative p-10 rounded-[2.5rem] shadow-xl overflow-hidden text-white group bg-slate-950 border border-slate-800 mb-8">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 backdrop-blur-md rounded-full w-fit border border-indigo-500/30 text-xs font-semibold tracking-wider uppercase text-indigo-300">
                            <User className="w-3.5 h-3.5 text-indigo-400" /> Account Settings
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400 tracking-tight">
                            Your Profile
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl">
                            Manage your personal information, subscription, and account security.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all duration-200 backdrop-blur-md"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 transition-all duration-200 backdrop-blur-md"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="px-4">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">{success}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent blur-2xl"></div>
                        
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-900 shadow-2xl relative ring-1 ring-slate-700 flex items-center justify-center">
                                {getImageUrl(profile.profileImage) ? (
                                    <img 
                                        src={getImageUrl(profile.profileImage)} 
                                        alt="" 
                                        className="w-full h-full object-cover relative z-10"
                                        key={getImageUrl(profile.profileImage)}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                const fallback = parent.querySelector('.fallback-icon');
                                                if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : null}
                                <div className={`absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-800 fallback-icon ${getImageUrl(profile.profileImage) ? 'hidden' : 'flex'}`}>
                                    <User className="w-16 h-16" />
                                </div>
                                
                                {saving && (
                                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 p-2 bg-indigo-500 text-white rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-slate-900 hover:bg-indigo-400 transition-all z-20 hover:scale-110"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div className="mt-6 text-center relative z-10">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">
                                {profile.firstName} {profile.lastName}
                            </h2>
                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mt-2 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-widest">
                                <Zap className="w-3 h-3" />
                                {profile.premiumType === 'FREE' ? 'Free Account' : `${profile.premiumType} Member`}
                            </div>
                            <div className="flex flex-col gap-2 mt-5">
                                <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-500" /> <span className="truncate max-w-[200px]">{profile.email}</span>
                                </p>
                                <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </p>
                                {profile.location && (
                                    <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-500" /> {profile.location}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="w-full mt-8 pt-8 border-t border-slate-800 space-y-5 relative z-10">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-slate-400 font-medium flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-indigo-400" /> Credit Balance
                                    </span>
                                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">{profile.dailyCredits ?? profile.glitter ?? profile.credit ?? 0}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(((profile.dailyCredits ?? profile.glitter ?? profile.credit ?? 0) / 10) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-500" /> Total Summaries
                                </span>
                                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">{profile.totalSummaries || profile.generatedSummary?.length || 0}</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-white/10 w-fit rounded-xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Usage Policy</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Your account adheres to our fair usage policy. {profile.premiumType === 'FREE' ? 'Upgrade to Premium for unlimited summaries and advanced models.' : 'Thank you for being a Premium member! Enjoy priority processing.'}
                            </p>
                            {profile.premiumExpiryDate && (
                                <p className="text-xs text-indigo-400 font-bold border-t border-white/10 pt-4">
                                    Premium expires: {new Date(profile.premiumExpiryDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-3">
                    <section className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]"></div>
                        
                        <div className="mb-10 relative z-10">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">Personal Details</h2>
                            <p className="text-slate-400 font-medium mt-1">Update your name and other public information.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">First Name</label>
                                    <input 
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium placeholder-slate-600 shadow-inner"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Last Name</label>
                                    <input 
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium placeholder-slate-600 shadow-inner"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <input 
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium placeholder-slate-600 shadow-inner"
                                            placeholder="Enter phone number"
                                        />
                                        <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Location</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium placeholder-slate-600 shadow-inner"
                                            placeholder="City, Country"
                                        />
                                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Bio / About</label>
                                <div className="relative">
                                    <textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium min-h-[120px] resize-none placeholder-slate-600 shadow-inner"
                                        placeholder="Tell us something about yourself..."
                                    />
                                    <Info className="absolute right-5 top-5 w-5 h-5 text-slate-500" />
                                </div>
                            </div>

                            <div className="space-y-2 opacity-70">
                                <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                                    Email Address <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 tracking-wider">LOCKED</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="w-full px-5 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl cursor-not-allowed font-medium shadow-inner"
                                    />
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>

            {/* Account Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 relative">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="p-4 bg-red-50 text-red-600 w-fit rounded-2xl mb-6">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Delete Account?</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            Are you sure you want to delete your account? This action is permanent and will remove all your saved summaries, notes, and credits.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDeleteAccount}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/20"
                            >
                                Yes, Delete My Account
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
