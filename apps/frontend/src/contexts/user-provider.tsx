import React, { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { User, UserContextType } from '../../types/auth';
import { UserContext } from './user-context';

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const buildUrl = (endpoint: string): string =>
    `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}${endpoint}`;

  const loadUser = async (): Promise<void> => {
    await checkAuth();
  };

  const checkAuth = async (): Promise<boolean> => {
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
      const parsedUserData: User = {
        id: userData.userID,
        username: userData.username,
        email: userData.email,
        firstname: userData.firstname,
        lastname: userData.lastname, 
        role: userData.role,
      };
      setUser(parsedUserData);
      setIsAuthenticated(true);
      return true;

    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
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
      localStorage.setItem('authToken', token);
      await loadUser();
      return true;
    } catch (error) {
      toast.error('Login error: ' + error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
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
    } catch (error) {
      toast.error('Logout error: ' + error);
      throw error;
    }
  };

  const googleAuth = async (): Promise<void> => {
    try {
      const response = await fetch(buildUrl('/auth/google'), {
        credentials: 'include',
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      toast.error('Google auth error: ' + error);
      throw new Error('Failed to initialize Google authentication');
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
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
    } catch (error) {
      toast.error('Password reset request error: ' + error);
      throw error;
    }
  };

  const updatePassword = async (password: string, accessToken: string): Promise<boolean> => {
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
    } catch (error) {
      toast.error('Password update error: ' + error);
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

  const contextValue: UserContextType = {
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

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}
