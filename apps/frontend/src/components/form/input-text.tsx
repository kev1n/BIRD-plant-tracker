import { ChangeEvent } from 'react';
import TextField from './text-field';
import TitledInput from './titled-input';

export interface InputTextProps {
  title: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value?: string;
  required?: boolean;
  className?: string;
}

const InputText = ({ title, className, ...rest }: InputTextProps) => {
  return (
    <TitledInput title={title} required={rest.required} className={className}>
      <TextField {...rest} />
    </TitledInput>
  );
};

export default InputText;
