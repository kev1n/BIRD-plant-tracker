import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form as FormUI } from '../../components/form/form';
import { useUser } from '../../hooks/useUser';
export default function RequestPasswordReset() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { requestPasswordReset } = useUser();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await requestPasswordReset(email);
            setSuccess(true);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request password reset');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-md mx-auto my-10 p-5", children: [_jsx("h2", { className: "text-xl font-semibold text-center text-gray-800 mb-5", children: "Reset Password" }), !success ? (_jsxs(FormUI, { onSubmit: handleSubmit, submitText: isLoading ? 'Sending...' : 'Reset Password', isSubmitting: isLoading, children: [_jsx("div", { className: "mb-4", children: _jsx(Input, { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "email", className: "w-full" }) }), error && (_jsx("div", { className: "text-destructive bg-destructive/10 p-3 rounded-md mb-4", children: error })), _jsx("div", { className: "text-center mt-4", children: _jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Back to Login" }) })] })) : (_jsxs("div", { children: [_jsx("div", { className: "text-green-700 bg-green-50 p-3 rounded-md mb-4", children: "Password reset instructions have been sent to your email. Please check your inbox and follow the instructions to reset your password. If you don't receive the email within a few minutes, please check your spam folder." }), _jsx("div", { className: "text-center mt-4", children: _jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Back to Login" }) })] }))] }));
}
