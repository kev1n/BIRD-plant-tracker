import { ChangeEvent } from 'react';
export interface InputTextProps {
    title: string;
    name: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string;
    required?: boolean;
    className?: string;
}
declare const InputText: ({ title, className, ...rest }: InputTextProps) => import("react/jsx-runtime").JSX.Element;
export default InputText;
//# sourceMappingURL=input-text.d.ts.map