import UsersList from '../components/users/users-list';
import { useUser } from '../hooks/useUser';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
      <div className="flex flex-col gap-5">
        <h1 className="text-4xl font-bold m-0">Home Page</h1>
        <h2 className="text-2xl font-normal m-0">Welcome, {user?.firstname || 'User'}!</h2>
      </div>
      <UsersList />
    </div>
  );
}
