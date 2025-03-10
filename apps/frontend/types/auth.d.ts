export interface SignupRequest {
    email: string;
    password: string;
    username?: string;
    firstname?: string;
    lastname?: string;
}
export interface User {
    id: string;
    username: string;
    email: string;
    firstname?: string;
    lastname?: string;
}
export interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    googleAuth: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<boolean>;
    updatePassword: (password: string, accessToken: string) => Promise<boolean>;
}
//# sourceMappingURL=auth.d.ts.map