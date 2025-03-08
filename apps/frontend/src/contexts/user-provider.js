import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { UserContext } from './user-context';
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const buildUrl = (endpoint) => `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}${endpoint}`;
    const loadUser = async () => {
        await checkAuth();
    };
    const checkAuth = async () => {
        const token = localStorage.getItem('authToken');
        console.log('Token from localStorage:', token);
        if (!token) {
            console.log('No token found, skipping auth check');
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return false;
        }
        try {
            const response = await fetch(buildUrl('/auth/me'), {
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Auth check failed');
            }
            const userData = await response.json();
            console.log('User data:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            return true;
        }
        catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    const login = async (email, password) => {
        try {
            const response = await fetch(buildUrl('/auth/login'), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Login failed');
            }
            const { token } = await response.json();
            console.log('Token received:', token);
            localStorage.setItem('authToken', token);
            await loadUser();
            return true;
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };
    const logout = async () => {
        try {
            const response = await fetch(buildUrl('/auth/logout'), {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
        }
        catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };
    const googleAuth = async () => {
        try {
            const response = await fetch(buildUrl('/auth/google'), {
                credentials: 'include',
            });
            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
            else {
                throw new Error('No authorization URL received');
            }
        }
        catch (error) {
            console.error('Google auth error:', error);
            throw new Error('Failed to initialize Google authentication');
        }
    };
    const requestPasswordReset = async (email) => {
        try {
            const response = await fetch(buildUrl('/auth/reset-password'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Password reset request failed');
            }
            return true;
        }
        catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    };
    const updatePassword = async (password, accessToken) => {
        try {
            const response = await fetch(buildUrl('/auth/reset-password'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ password }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Password update failed');
            }
            return true;
        }
        catch (error) {
            console.error('Password update error:', error);
            throw error;
        }
    };
    useEffect(() => {
        const initialize = async () => {
            await loadUser();
        };
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const contextValue = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        login,
        logout,
        loadUser,
        checkAuth,
        googleAuth,
        requestPasswordReset,
        updatePassword,
    };
    return _jsx(UserContext.Provider, { value: contextValue, children: children });
}
