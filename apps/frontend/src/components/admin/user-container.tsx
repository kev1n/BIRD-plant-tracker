import type { User } from '../../../types/auth';

interface UserContainerProps {
    users: User[];
    containerTitle: string;
}

export default function UserContainer<T>(props: UserContainerProps) {
    
    const users: User[] = props.users
    
    return (
        <div>
            <h3>{props.containerTitle}</h3>
            <div className="mt-8 w-full max-w-3xl mx-auto">
                {users.length === 0 ? (
                    <p>No roles requested.</p>
                ) : (
                    props.users.map(user => (
                        <RoleRequest 
                            username={user.username} 
                            email={user.email}
                        />
                    ))
                )}
                </div>
        </div>
    )
}