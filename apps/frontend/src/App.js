import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { PrivateRoute, PublicOnlyRoute } from './components/protected-routes';
import { UserProvider } from './contexts/user-provider';
import NavLayout from './layouts/nav-layouts';
import AuthCallback from './pages/account/auth-callback';
import EmailVerification from './pages/account/email-verifcation';
import Login from './pages/account/login';
import RequestPasswordReset from './pages/account/request-password-reset';
import ResetPassword from './pages/account/reset-password';
import Home from './pages/home';
import NotFound from './pages/not-found';
import SignUp from './pages/signup';
function App() {
    return (_jsx(UserProvider, { children: _jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsxs(Route, { path: "/", element: _jsx(NavLayout, {}), children: [_jsx(Route, { element: _jsx(PrivateRoute, {}), children: _jsx(Route, { index: true, element: _jsx(Home, {}) }) }), _jsxs(Route, { element: _jsx(PublicOnlyRoute, {}), children: [_jsx(Route, { path: "login", element: _jsx(Login, {}) }), _jsx(Route, { path: "signup", element: _jsx(SignUp, {}) }), _jsx(Route, { path: "forgot-password", element: _jsx(RequestPasswordReset, {}) })] }), _jsx(Route, { path: "auth/callback", element: _jsx(AuthCallback, {}) }), _jsx(Route, { path: "auth/reset-password", element: _jsx(ResetPassword, {}) }), _jsx(Route, { path: "auth/verify-email", element: _jsx(EmailVerification, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }) }));
}
export default App;
