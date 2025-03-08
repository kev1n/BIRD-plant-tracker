import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updatePassword } = useUser();
    const navigate = useNavigate();
    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        const type = hashParams.get('type');
        console.log('Hash parameters:', {
            hasAccessToken: !!access_token,
            type,
        });
        if (!access_token) {
            setError('No reset token found. Please request a new password reset link.');
        }
        else if (type !== 'recovery') {
            setError('Invalid reset link type. Please request a new password reset link.');
        }
    }, []);
    const checkPasswordStrength = (pass) => {
        if (!pass)
            return 'none';
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumbers = /\d/.test(pass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        const strength = (hasUpperCase ? 1 : 0) +
            (hasLowerCase ? 1 : 0) +
            (hasNumbers ? 1 : 0) +
            (hasSpecialChar ? 1 : 0) +
            (pass.length >= 8 ? 1 : 0);
        if (strength >= 4)
            return 'strong';
        if (strength >= 2)
            return 'medium';
        return 'weak';
    };
    const validatePassword = (pass) => {
        const requirements = [];
        if (pass.length < 8) {
            requirements.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(pass)) {
            requirements.push('Include at least one uppercase letter');
        }
        if (!/[a-z]/.test(pass)) {
            requirements.push('Include at least one lowercase letter');
        }
        if (!/\d/.test(pass)) {
            requirements.push('Include at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            requirements.push('Include at least one special character');
        }
        return requirements;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        if (!access_token) {
            setError('Reset token not found. Please request a new password reset link.');
            return;
        }
        const requirements = validatePassword(password);
        if (requirements.length > 0) {
            setError(requirements.join(', '));
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            console.log('Attempting password reset with token');
            await updatePassword(password, access_token);
            navigate('/login', {
                state: {
                    message: 'Password has been reset successfully. Please login with your new password.',
                },
                replace: true,
            });
        }
        catch (err) {
            console.error('Password reset error:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const passwordStrength = checkPasswordStrength(password);
    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-400',
        strong: 'bg-green-500',
        none: 'bg-gray-200'
    };
    const strengthWidths = {
        weak: 'w-1/3',
        medium: 'w-2/3',
        strong: 'w-full',
        none: 'w-0'
    };
    return (_jsxs("div", { className: "max-w-md mx-auto my-10 p-5", children: [_jsx("h2", { className: "text-xl font-semibold mb-6", children: "Set New Password" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-5", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx(Input, { type: "password", placeholder: "New Password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "mb-1" }), _jsx("div", { className: "h-1 mb-2", children: _jsx("div", { className: cn("h-full transition-all", strengthColors[passwordStrength], strengthWidths[passwordStrength]) }) }), password && (_jsx("ul", { className: "text-xs text-muted-foreground pl-5 list-disc", children: validatePassword(password).map((req, index) => (_jsx("li", { children: req }, index))) }))] }), _jsx(Input, { type: "password", placeholder: "Confirm New Password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true }), _jsx(Button, { type: "submit", disabled: isLoading, children: isLoading ? 'Updating...' : 'Update Password' }), error && _jsx("p", { className: "text-destructive mt-2", children: error })] })] }));
}
