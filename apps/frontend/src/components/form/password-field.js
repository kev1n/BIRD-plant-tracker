import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { EyeClosedIcon, EyeIcon } from './icons';
const PasswordField = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    return (_jsxs("div", { className: "relative w-full", children: [_jsx(Input, { type: showPassword ? 'text' : 'password', placeholder: props.placeholder || 'Password', ...props }), _jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer", onClick: toggleShowPassword, children: showPassword ? _jsx(EyeClosedIcon, {}) : _jsx(EyeIcon, {}) })] }));
};
export default PasswordField;
