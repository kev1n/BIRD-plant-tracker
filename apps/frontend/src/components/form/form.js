import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function Form({ children, onSubmit, title, subtitle, submitText = 'Submit', isSubmitting = false, className, }) {
    return (_jsxs("form", { className: cn("flex flex-col gap-4 p-8 rounded-lg bg-white shadow-md w-full max-w-[450px]", className), onSubmit: onSubmit, children: [(title || subtitle) && (_jsxs("div", { className: "mb-4", children: [title && _jsx("h2", { className: "text-2xl m-0 text-center", children: title }), subtitle && _jsx("p", { className: "text-muted-foreground mt-2 mb-0 text-center", children: subtitle })] })), children, _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full mt-4", children: isSubmitting ? 'Processing...' : submitText })] }));
}
