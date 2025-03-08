import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
                const response = await fetch(`${baseUrl}/auth/users`, {
                    credentials: 'include',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching users');
                console.error('Error fetching users:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
    if (loading) {
        return _jsx("div", { className: "text-center p-4", children: "Loading users..." });
    }
    if (error) {
        return _jsxs("div", { className: "text-destructive p-4 text-center", children: ["Error: ", error] });
    }
    return (_jsx("div", { className: "mt-8 w-full max-w-3xl mx-auto", children: users.length === 0 ? (_jsx("p", { children: "No users found." })) : (users.map(user => (_jsx(Card, { className: "mb-4", children: _jsx(CardContent, { className: "p-4", children: _jsx("div", { className: "flex gap-4 items-center", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold m-0", children: [user.firstname, " ", user.lastname, " (", user.username || 'No username', ")"] }), _jsx("p", { className: "text-muted-foreground m-0", children: user.email })] }) }) }) }, user.email)))) }));
}
