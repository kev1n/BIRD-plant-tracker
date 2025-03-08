import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';
import { EyeClosedIcon, EyeIcon } from './icons';

interface PasswordFieldProps {
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value?: string;
  required?: boolean;
  className?: string;
}

const PasswordField = (props: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder={props.placeholder || 'Password'}
        {...props}
      />
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        onClick={toggleShowPassword}
      >
        {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
      </div>
    </div>
  );
};

export default PasswordField;
