import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { User } from '../../../types/auth';

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const response = await fetch(`${baseUrl}/auth/users`, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching users');
        toast.error('Error fetching users: ' + err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-destructive p-4 text-center">Error: {error}</div>;
  }

  return (
    <div className="mt-8 w-full max-w-3xl mx-auto">
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map(user => (
          <Card key={user.email} className="mb-4">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div>
                  <h3 className="text-lg font-semibold m-0">
                    {user.firstname} {user.lastname} ({user.username || 'No username'})
                  </h3>
                  <p className="text-muted-foreground m-0">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
