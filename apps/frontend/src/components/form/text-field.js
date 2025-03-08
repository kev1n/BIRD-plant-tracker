import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from '@/components/ui/input';
const TextField = (props) => {
    return _jsx(Input, { type: "text", placeholder: props.placeholder || 'Text Here', ...props });
};
export default TextField;
