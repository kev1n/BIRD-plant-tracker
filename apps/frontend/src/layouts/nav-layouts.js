import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import Footer from '../components/navigation/footer';
import NavBar from '../components/navigation/nav-bar';
export default function NavLayout() {
    return (_jsxs("div", { className: "flex flex-col h-screen", children: [_jsx(NavBar, {}), _jsx(Outlet, {}), _jsx(Footer, {})] }));
}
