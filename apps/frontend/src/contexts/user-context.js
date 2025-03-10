import { createContext } from 'react';
export const UserContext = createContext({
    user: null,
    setUser: () => { },
    isLoading: false,
    isAuthenticated: false,
    login: async () => false,
    logout: async () => { },
    loadUser: async () => { },
    checkAuth: async () => false,
    googleAuth: async () => { },
    requestPasswordReset: async () => false,
    updatePassword: async () => false,
});
