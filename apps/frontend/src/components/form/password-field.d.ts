import { ChangeEvent } from 'react';
interface PasswordFieldProps {
    name: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string;
    required?: boolean;
    className?: string;
}
declare const PasswordField: (props: PasswordFieldProps) => import("react/jsx-runtime").JSX.Element;
export default PasswordField;
//# sourceMappingURL=password-field.d.ts.map