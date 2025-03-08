import { jsx as _jsx } from "react/jsx-runtime";
import PasswordField from './password-field';
import TitledInput from './titled-input';
const InputPassword = ({ title, className, ...rest }) => {
    return (_jsx(TitledInput, { title: title, required: rest.required, className: className, children: _jsx(PasswordField, { ...rest }) }));
};
export default InputPassword;
