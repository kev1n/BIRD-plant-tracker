import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form } from '../../components/form/form';
import { Input } from '../../components/form/input';
import { useUser } from '../../hooks/useUser';

interface LoginState {
  email: string;
  password: string;
}

interface LocationState {
  from?: Location;
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<LoginState>({
    email: '',
    password: '',
  });

  const locationState = location.state as LocationState;
  const redirectPath = locationState?.from?.pathname || '/';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formState.email, formState.password);
      if (success) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Form
        onSubmit={handleSubmit}
        title="Log In"
        isSubmitting={isLoading}
        submitText={isLoading ? 'Logging in...' : 'Log In'}
      >
        {locationState?.message && (
          <div className="text-green-600 mb-4 text-center">{locationState.message}</div>
        )}

        {error && <p className="text-destructive text-center mb-2">{error}</p>}

        <Input.Text
          title="Email"
          name="email"
          placeholder="example@domain.com"
          value={formState.email}
          onChange={handleChange}
          required
        />

        <Input.Password
          title="Password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end w-full mt-2">
          <Link to="/forgot-password" className="text-primary text-sm hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </Form>
      <Link to="/map" className="text-primary hover:underline">
        Map
      </Link>
    </div>
  );
}
