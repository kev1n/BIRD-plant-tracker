import { jsx as _jsx } from "react/jsx-runtime";
import TextField from './text-field';
import TitledInput from './titled-input';
const InputText = ({ title, className, ...rest }) => {
    return (_jsx(TitledInput, { title: title, required: rest.required, className: className, children: _jsx(TextField, { ...rest }) }));
};
export default InputText;
