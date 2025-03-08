import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
export default function AuthCallback() {
    const navigate = useNavigate();
    const { checkAuth } = useUser();
    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('AuthCallback mounted');
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const access_token = params.get('access_token');
                console.log('Token status:', access_token ? 'present' : 'missing');
                if (!access_token) {
                    throw new Error('No access token received');
                }
                const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
                const response = await fetch(`${baseUrl}/auth/callback`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ access_token }),
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Authentication failed');
                }
                localStorage.setItem('authToken', access_token);
                await new Promise(resolve => setTimeout(resolve, 100));
                const authSuccess = await checkAuth();
                if (authSuccess) {
                    navigate('/', { replace: true });
                }
                else {
                    throw new Error('Authentication verification failed');
                }
            }
            catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login', {
                    state: { error: error instanceof Error ? error.message : 'Authentication failed' },
                    replace: true,
                });
            }
        };
        handleCallback();
    }, [navigate, checkAuth]);
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("p", { className: "text-base text-gray-700", children: "Completing authentication..." }) }));
}
