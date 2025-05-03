import { useState, useEffect } from 'react';
import type { User } from '../../types/auth';
import UserContainer from '@/components/admin/user-container';
import AllUsers from '@/components/admin/all-users';
import RoleRequest from '@/components/admin/role-request';
import UserRoleInfo from '@/components/admin/user-role-info';

export default function AdminPage(){
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const response = await fetch(`${baseUrl}/auth/users`,{
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
    
        const users = await response.json();
    
        if (!response.ok) {
          throw new Error(users.error || 'Failed to fetch users');
        }
    
        setUsers(users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching users');
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  })

  // for the Role Requests panel, only show people actively requesting
  const filteredUsers = [...users].filter((user) => user.roleRequested != null);

  return(
    <div>
      {error ? (<p>{error}</p>) : (
      <div>
        <UserContainer users={filteredUsers} containerTitle='Role Requests' UserComponent={RoleRequest}/>
        <AllUsers users={users} containerTitle='All Users' UserComponent={UserRoleInfo}/>
      </div> 
      )}
    </div>
  )
}
