import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import ProfileLogo from '../../assets/logos/avatar.svg';
import BirdLogo from '../../assets/logos/bird_logo.svg';
import Lock from '../../assets/logos/lock.svg';
export default function NavBar() {
    const navigate = useNavigate();
    return (_jsxs("nav", { className: "flex gap-2.5 p-2.5 px-5 text-xl items-center flex-wrap md:flex-nowrap border-b-2 border-black shadow-xl", children: [_jsxs("div", { className: "flex-1 flex gap-2.5", children: [_jsx("img", { src: BirdLogo, alt: "Sanctuary Logo" }), _jsx("button", { className: "p-0 text-3xl font-bold font-serif bg-transparent border-none cursor-pointer text-lime-600", onClick: () => navigate('/'), children: "CSBBS Plant Tracker" })] }), _jsxs("ul", { className: "p-0 m-0 list-none flex gap-10 items-center font-bold font-serif text-1xl text-violet-950", children: [_jsx("li", { children: _jsx(Link, { to: '/about', children: "About" }) }), _jsx("li", { children: _jsx(Link, { to: '/map', children: "Map" }) }), _jsx("li", { children: _jsx(Link, { to: '/spreadsheet', children: "Spreadsheet" }) }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("img", { src: Lock, alt: "Lock symbol" }), _jsx(Link, { to: '/admin', children: "Admin" })] }), _jsx("li", { children: _jsx("img", { src: ProfileLogo, alt: "Profile Image" }) })] })] }));
}
