import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export function PrivateRoute({ allowedRoles }: { allowedRoles?: string[]}) {
  const { user, isLoading } = useUser();

  console.log('user: ', user);
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if roles are restricted, and user.role isn't in the allowed list, kick out
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="*" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return !user ? <Outlet /> : <Navigate to="/" replace />;
}
