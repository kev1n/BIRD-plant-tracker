import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

export default function ResetPassword() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    } else if (type !== 'recovery') {
      setError('Invalid reset link type. Please request a new password reset link.');
    }
  }, []);

  const checkPasswordStrength = (pass: string): 'weak' | 'medium' | 'strong' | 'none' => {
    if (!pass) return 'none';

    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    const strength =
      (hasUpperCase ? 1 : 0) +
      (hasLowerCase ? 1 : 0) +
      (hasNumbers ? 1 : 0) +
      (hasSpecialChar ? 1 : 0) +
      (pass.length >= 8 ? 1 : 0);

    if (strength >= 4) return 'strong';
    if (strength >= 2) return 'medium';
    return 'weak';
  };

  const validatePassword = (pass: string): string[] => {
    const requirements: string[] = [];

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
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

  return (
    <div className="max-w-md mx-auto my-10 p-5">
      <h2 className="text-xl font-semibold mb-6">Set New Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col">
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className="mb-1"
          />
          <div className="h-1 mb-2">
            <div className={cn("h-full transition-all", strengthColors[passwordStrength], strengthWidths[passwordStrength])} />
          </div>
          {password && (
            <ul className="text-xs text-muted-foreground pl-5 list-disc">
              {validatePassword(password).map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          )}
        </div>
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
        {error && <p className="text-destructive mt-2">{error}</p>}
      </form>
    </div>
  );
}
