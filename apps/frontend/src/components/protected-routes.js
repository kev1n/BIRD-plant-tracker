import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
export function PrivateRoute() {
    const { user, isLoading } = useUser();
    console.log('user: ', user);
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center h-screen", children: "Loading..." });
    }
    return user ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", replace: true });
}
export function PublicOnlyRoute() {
    const { user, isLoading } = useUser();
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center h-screen", children: "Loading..." });
    }
    return !user ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/", replace: true });
}
