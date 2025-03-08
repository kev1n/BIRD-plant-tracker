import InputPassword, { InputPasswordProps } from './input-password';
import InputText, { InputTextProps } from './input-text';

export type { InputPasswordProps, InputTextProps };

export const Input = {
  Text: InputText,
  Password: InputPassword,
};
