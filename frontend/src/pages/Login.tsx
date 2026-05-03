import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { signInWithGoogle } from '../firebase';
import { getIdToken } from 'firebase/auth';
import { Brain, Video, Music, Layout, Sparkles, CheckCircle2, UserCircle } from 'lucide-react';

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const firebaseUser = await signInWithGoogle();
            const idToken = await getIdToken(firebaseUser, true);

            const payload = {
                email: firebaseUser.email,
                firebaseUserId: firebaseUser.uid,
                firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                profileImage: firebaseUser.photoURL || '',
                pushToken: 'web-dummy-push-token',
                deviceId: localStorage.getItem('deviceId') || `web-${Math.random().toString(36).substr(2, 9)}`,
                deviceType: 'web'
            };

            const res = await api.post('/auth/loginWithGoogle', payload, {
                headers: {
                    'google-id-token': idToken
                }
            });

            const backendToken = res.headers['x-auth-token'] || res.data?.token || idToken;

            if (backendToken) {
                localStorage.removeItem('token');
                localStorage.setItem('token', backendToken);
                if (res.data) {
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
                window.location.href = '/dashboard'; 
            } else {
                setError('Login failed. No token received from server.');
            }
        } catch (err: any) {
            console.error("Login Error: ", err);
            setError(err.response?.data?.message || err.message || 'Failed to login with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setGuestLoading(true);
        setError('');

        try {
            // Get or create a deviceId
            let deviceId = localStorage.getItem('deviceId');
            if (!deviceId) {
                deviceId = `web-guest-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('deviceId', deviceId);
            }

            const payload = {
                deviceId: deviceId,
                pushToken: 'web-dummy-push-token',
                deviceType: 'web',
                firstName: 'Guest',
                lastName: 'User'
            };

            const res = await api.post('/auth/guest', payload);
            
            const backendToken = res.headers['x-auth-token'] || res.data?.token;

            if (backendToken) {
                localStorage.removeItem('token');
                localStorage.setItem('token', backendToken);
                if (res.data) {
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
                window.location.href = '/dashboard'; 
            } else {
                // Some backends might return the user object directly with token in headers
                // If it worked but token is missing in body, check headers again
                setError('Guest login failed. Could not authenticate.');
            }
        } catch (err: any) {
            console.error("Guest Login Error: ", err);
            setError(err.response?.data?.message || err.message || 'Failed to continue as guest');
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>

            <div className="container max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Product Branding & Features */}
                <div className="hidden lg:flex flex-col space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">SmartNoter</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-bold leading-tight text-white">
                            Master Your Content with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">AI Intelligence.</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                            AI based audio, video & text summarization with automated quiz generation.
                        </p>
                    </div>


                    
                </div>

                {/* Right Side: Login Card */}
                <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                    <div className="max-w-md w-full p-1 bg-gradient-to-br from-slate-700 up-to-slate-800 rounded-3xl shadow-2xl">
                        <div className="bg-[#1E293B] p-10 rounded-[1.4rem] text-center border border-slate-700/50 shadow-inner">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
                                <div className="p-3 bg-indigo-600 rounded-2xl">
                                    <Brain className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-extrabold text-white">SmartNoter</h1>
                                <p className="text-slate-400 text-sm">AI based audio, video & text summarization with automated quiz generation.</p>
                            </div>

                            <div className="mb-10 text-left">
                                <h2 className="text-3xl font-bold text-white mb-2">Get Started</h2>
                                <p className="text-slate-400">Choose how you want to access SmartNoter.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-100 rounded-2xl text-sm flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading || guestLoading}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-1 active:translate-y-0 shadow-lg"
                                >
                                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        <path fill="none" d="M0 0h48v48H0z" />
                                    </svg>
                                    {loading ? 'Please wait...' : 'Sign in with Google'}
                                </button>

                                <div className="relative py-4 flex items-center">
                                    <div className="flex-grow border-t border-slate-700/50"></div>
                                    <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Or</span>
                                    <div className="flex-grow border-t border-slate-700/50"></div>
                                </div>

                                <button
                                    onClick={handleGuestLogin}
                                    disabled={loading || guestLoading}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-1 active:translate-y-0 shadow-lg"
                                >
                                    <UserCircle className="w-5 h-5 text-indigo-400" />
                                    {guestLoading ? 'Setting up Guest...' : 'Continue as Guest'}
                                </button>

                                <div className="pt-8 space-y-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                        <p className="text-sm text-slate-400">Secure AES-256 cloud encryption</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-left">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                        <p className="text-sm text-slate-400">Multi-language AI translation built-in</p>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="mt-12 text-slate-500 text-xs">
                                By signing in, you agree to our <span className="underline hover:text-indigo-400 transition cursor-pointer">Terms</span> and <span className="underline hover:text-indigo-400 transition cursor-pointer">Privacy Policy</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
