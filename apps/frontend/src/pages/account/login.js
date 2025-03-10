import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form } from '../../components/form/form';
import { Input } from '../../components/form/input';
import { useUser } from '../../hooks/useUser';
export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formState, setFormState] = useState({
        email: '',
        password: '',
    });
    const locationState = location.state;
    const redirectPath = locationState?.from?.pathname || '/';
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const success = await login(formState.email, formState.password);
            if (success) {
                navigate(redirectPath, { replace: true });
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Login failed. Please check your credentials and try again.';
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-[80vh]", children: _jsxs(Form, { onSubmit: handleSubmit, title: "Log In", isSubmitting: isLoading, submitText: isLoading ? 'Logging in...' : 'Log In', children: [locationState?.message && (_jsx("div", { className: "text-green-600 mb-4 text-center", children: locationState.message })), error && _jsx("p", { className: "text-destructive text-center mb-2", children: error }), _jsx(Input.Text, { title: "Email", name: "email", placeholder: "example@domain.com", value: formState.email, onChange: handleChange, required: true }), _jsx(Input.Password, { title: "Password", name: "password", value: formState.password, onChange: handleChange, required: true }), _jsx("div", { className: "flex justify-end w-full mt-2", children: _jsx(Link, { to: "/forgot-password", className: "text-primary text-sm hover:underline", children: "Forgot Password?" }) }), _jsxs("div", { className: "mt-4 text-center", children: ["Don't have an account? ", _jsx(Link, { to: "/signup", className: "text-primary hover:underline", children: "Sign up" })] })] }) }));
}
