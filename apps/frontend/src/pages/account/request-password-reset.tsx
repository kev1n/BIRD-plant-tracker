import PageHead from '@/components/PageHead';
import { Input } from '@/components/ui/input';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form as FormUI } from '../../components/form/form';
import { useUser } from '../../hooks/useUser';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { requestPasswordReset } = useUser();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHead 
        title="Reset Password" 
        description="Request a password reset for your BIRD Plant Tracker account" 
      />
      <div className="max-w-md mx-auto my-10 p-5">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-5">Reset Password</h2>
        {!success ? (
          <FormUI
            onSubmit={handleSubmit}
            submitText={isLoading ? 'Sending...' : 'Reset Password'}
            isSubmitting={isLoading}
          >
            <div className="mb-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-destructive bg-destructive/10 p-3 rounded-md mb-4">{error}</div>
            )}

            <div className="text-center mt-4">
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </FormUI>
        ) : (
          <div>
            <div className="text-green-700 bg-green-50 p-3 rounded-md mb-4">
              Password reset instructions have been sent to your email. Please check your inbox and
              follow the instructions to reset your password. If you don't receive the email within a
              few minutes, please check your spam folder.
            </div>
            <div className="text-center mt-4">
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
