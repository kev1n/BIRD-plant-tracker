import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SignupRequest } from '../../types/auth.ts';
import { Form } from '../components/form/form';
import { Input } from '../components/form/input';

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<SignupRequest>({
    email: '',
    password: '',
    username: '',
    firstname: '',
    lastname: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev: SignupRequest) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (formState.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          username: formState.username || undefined,
          firstname: formState.firstname || undefined,
          lastname: formState.lastname || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please check your email to verify your account.',
        },
        replace: true,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      <Form
        onSubmit={handleSubmit}
        title="Create an Account"
        subtitle="Join us to access exclusive features"
        submitText="Sign Up"
        isSubmitting={isLoading}
      >
        {error && <p className="text-destructive text-center mb-2">{error}</p>}

        <Input.Text
          title="Email"
          name="email"
          placeholder="example@domain.com"
          value={formState.email}
          onChange={handleChange}
          required
        />

        <Input.Text
          title="Username"
          name="username"
          placeholder="johnsmith"
          value={formState.username || ''}
          onChange={handleChange}
        />

        <Input.Text
          title="First Name"
          name="firstname"
          placeholder="John"
          value={formState.firstname || ''}
          onChange={handleChange}
        />

        <Input.Text
          title="Last Name"
          name="lastname"
          placeholder="Smith"
          value={formState.lastname || ''}
          onChange={handleChange}
        />

        <Input.Password
          title="Password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          required
        />

        <div className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </Form>
    </div>
  );
}
