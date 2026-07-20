import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    user: any | null;
    isLoading: boolean;
    setAuthData: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // ✅ Synchronous init from localStorage — NO delay on page load
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<any | null>(() => {
        const stored = localStorage.getItem('user');
        try { return stored ? JSON.parse(stored) : null; } catch { return null; }
    });
    const [isLoading, setIsLoading] = useState(false); // Already resolved from localStorage

    const setAuthData = (newToken: string, newUser: any) => {
        localStorage.setItem('token', newToken);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        }
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, setAuthData, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
