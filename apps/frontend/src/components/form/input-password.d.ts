import { ChangeEvent } from 'react';
export interface InputPasswordProps {
    title: string;
    name: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string;
    required?: boolean;
    className?: string;
}
declare const InputPassword: ({ title, className, ...rest }: InputPasswordProps) => import("react/jsx-runtime").JSX.Element;
export default InputPassword;
//# sourceMappingURL=input-password.d.ts.map