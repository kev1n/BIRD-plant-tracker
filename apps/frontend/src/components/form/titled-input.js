import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
const TitledInput = ({ title, required, children, className }) => {
    return (_jsxs("div", { className: cn("grid w-full items-center gap-1.5", className), children: [_jsxs(Label, { className: "mb-1", children: [title, required && _jsx("span", { className: "text-destructive ml-0.5", children: "*" })] }), children] }));
};
export default TitledInput;
