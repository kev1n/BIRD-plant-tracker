import { useState } from 'react';
import type { User } from '../../../types/auth';
import UserContainer from "./user-container";
import UserRoleInfo from './user-role-info';

interface UserContainerProps {
    users: User[];
    containerTitle: string;
    UserComponent: React.ComponentType<User>;
}
export default function AllUsers(props: UserContainerProps ) {
    
    const [searchQuery, setSearchQuery] = useState('');
    
    return (
        <div>
            <div>
                <input
                    className="pl-3 pr-3 mt-2 border-2 rounded border-gray-700 w-full max-w-2xl mx-auto"
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div>
            <UserContainer
                users={props.users.filter(
                (user) =>
                    user.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.username.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                containerTitle="All Users"
                UserComponent={UserRoleInfo}
            />
            </div>
        </div>
        

    )
}