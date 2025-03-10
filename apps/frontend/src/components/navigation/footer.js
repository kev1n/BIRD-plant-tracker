import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CSBBSLogo from '../../assets/logos/csbbs_logo.svg';
export default function Footer() {
    return (_jsx("footer", { className: "flex gap-2.5 p-2.5 px-5 text-xl items-center flex-wrap md:flex-nowrap border-t-2 border-black shadow-lg sticky top-[100vh]", children: _jsx("div", { className: "flex-1 flex gap-2.5", children: _jsxs("ul", { className: "p-0 m-0 list-none flex gap-10 items-center font-serif text-1s text-violet-950", children: [_jsx("img", { className: "w-24", src: CSBBSLogo, alt: "sanctuary logo" }), _jsxs("li", { children: [_jsx("p", { className: "text-left", children: "Copyright \u00A9 2025" }), _jsx("p", { className: "text-left", children: "Clark Street Bird Sanctuary" })] })] }) }) }));
}
