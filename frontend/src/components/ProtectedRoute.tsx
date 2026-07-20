import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { token, isLoading } = useAuth();

    // Wait for Firebase to resolve auth state before making any redirect decision
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
