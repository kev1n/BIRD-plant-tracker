import { ChangeEvent } from 'react';
import PasswordField from './password-field';
import TitledInput from './titled-input';

export interface InputPasswordProps {
  title: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value?: string;
  required?: boolean;
  className?: string;
}

const InputPassword = ({ title, className, ...rest }: InputPasswordProps) => {
  return (
    <TitledInput title={title} required={rest.required} className={className}>
      <PasswordField {...rest} />
    </TitledInput>
  );
};

export default InputPassword;
