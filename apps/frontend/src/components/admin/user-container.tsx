import type { User } from '../../../types/auth';

interface UserContainerProps {
    users: User[];
    containerTitle: string;
}

interface UserContainerProps {
    users: User[];
    containerTitle: string;
    UserComponent: React.ComponentType<User>; // the type of component to create a list of
}

export default function UserContainer(props: UserContainerProps) {
    const { users, containerTitle, UserComponent } = props;

    return (
        <div className="m-2 border border-gray-700 rounded-[3px]">
            <h3 className="m-4">{containerTitle}</h3>
            <div className="mt-4 w-full max-w-3xl mx-auto">
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    users.map((user) => (
                        <UserComponent key={user.email} {...user} />
                    ))
                )}
            </div>
        </div>
    );
}