import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import UsersList from '../components/users/users-list';
import { useUser } from '../hooks/useUser';
export default function Home() {
    const { user } = useUser();
    return (_jsxs("div", { className: "flex-1 flex flex-col justify-center items-center text-center p-8", children: [_jsxs("div", { className: "flex flex-col gap-5", children: [_jsx("h1", { className: "text-4xl font-bold m-0", children: "Home Page" }), _jsxs("h2", { className: "text-2xl font-normal m-0", children: ["Welcome, ", user?.firstname || 'User', "!"] })] }), _jsx(UsersList, {})] }));
}
