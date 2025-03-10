import { FormEvent, ReactNode } from 'react';
interface FormProps {
    children: ReactNode;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    title?: string;
    subtitle?: string;
    submitText?: string;
    isSubmitting?: boolean;
    className?: string;
}
export declare function Form({ children, onSubmit, title, subtitle, submitText, isSubmitting, className, }: FormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=form.d.ts.map