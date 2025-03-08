import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
const LogoutModal = ({ isOpen, onClose, onLogout }) => {
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm Logout" }), _jsx(DialogDescription, { children: "Are you sure you want to log out?" })] }), _jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: onLogout, children: "Logout" })] })] }) }));
};
export default LogoutModal;
