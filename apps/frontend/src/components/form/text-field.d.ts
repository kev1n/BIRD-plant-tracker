import { ChangeEvent } from 'react';
interface TextFieldProps {
    name: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string;
    required?: boolean;
    className?: string;
}
declare const TextField: (props: TextFieldProps) => import("react/jsx-runtime").JSX.Element;
export default TextField;
//# sourceMappingURL=text-field.d.ts.map