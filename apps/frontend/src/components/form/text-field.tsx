import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';

interface TextFieldProps {
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value?: string;
  required?: boolean;
  className?: string;
}

const TextField = (props: TextFieldProps) => {
  return <Input type="text" placeholder={props.placeholder || 'Text Here'} {...props} />;
};

export default TextField;
