import { useState } from 'react';
import type { User } from '../../types/auth';

export default function AdminPage(){
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/users`,{
        method: 'GET',
        headers: {
          'Authorization': 'application/json',
        }
      });
  
      const users = await response.json();
  
      if (!response.ok) {
        throw new Error(users.error || 'Failed to fetch users');
      }
  
      return users;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
      console.error('Error fetching users:', err);
    }
  }


  return(
    <div>
      <div>
        
      </div>
      <div>

      </div>
    </div>
  )
}
