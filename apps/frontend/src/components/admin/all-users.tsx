import type { User } from '../../../types/auth';
import UserContainer from "./user-container";

interface UserContainerProps {
    users: User[];
    containerTitle: string;
}
export default function AllUsers(props: UserContainerProps ) {
    return (
        <div>
            <input> Search Bar </input>
            <UserContainer users={props.users} containerTitle="All Users"/>
        </div>

    )
}