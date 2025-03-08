import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
export default function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking');
    useEffect(() => {
        const error = searchParams.get('error');
        const success = searchParams.get('success');
        if (success) {
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        }
        else if (error) {
            setStatus('error');
        }
    }, [searchParams, navigate]);
    return (_jsxs("div", { className: "flex-1 flex flex-col justify-center items-center text-center pt-[100px]", children: [status === 'checking' && _jsx("h1", { className: "text-4xl font-bold m-0", children: "Checking verification status..." }), status === 'success' && (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-4xl font-bold m-0", children: "Email Verified!" }), _jsx("h2", { className: "text-2xl font-normal m-0", children: "You'll be redirected to login in 3 seconds..." })] })), status === 'error' && (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-4xl font-bold m-0", children: "Verification Failed" }), _jsx("h2", { className: "text-2xl font-normal m-0", children: "Please try signing up again or contact support." })] }))] }));
}
