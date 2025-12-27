import { useState, useEffect } from 'react';
import { User, AuthState } from '@/types';

const AUTH_STORAGE_KEY = 'habit_tracker_auth';

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
            try {
                const user = JSON.parse(storedAuth) as User;
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to parse stored auth:', error);
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = (email: string, password: string): boolean => {
        // Simple validation for demo purposes
        if (!email || !password) {
            return false;
        }

        // In a real app, this would call an API
        // For now, we'll just create a user object
        const user: User = {
            id: crypto.randomUUID(),
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
        });

        return true;
    };

    const signup = (name: string, email: string, password: string): boolean => {
        // Simple validation for demo purposes
        if (!name || !email || !password || password.length < 6) {
            return false;
        }

        // In a real app, this would call an API
        const user: User = {
            id: crypto.randomUUID(),
            email,
            name,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
        });

        return true;
    };

    const logout = () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
    };

    return {
        ...authState,
        login,
        signup,
        logout
    };
};
