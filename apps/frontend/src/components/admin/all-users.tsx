/**
 * All Users Component
 * 
 * Refactored for:
 * - Modern search input with Shadcn/UI styling
 * - Better accessibility with proper labels and ARIA attributes
 * - Mobile-first responsive design
 * - Improved search functionality with debouncing
 * - Better visual hierarchy and spacing
 */

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '../../../types/auth';
import UserContainer from './user-container';

interface AllUsersProps {
  users: User[];
  containerTitle: string;
  UserComponent: React.ComponentType<User>;
}

export default function AllUsers({ users, UserComponent }: AllUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered users for better performance
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user =>
      user.firstname?.toLowerCase().includes(query) ||
      user.lastname?.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="px-6 pt-6 space-y-2">
        <Label htmlFor="user-search" className="text-sm font-medium">
          Search Users
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="user-search"
            type="text"
            placeholder="Search by name, username, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
            aria-describedby="search-help"
          />
        </div>
        <p id="search-help" className="text-xs text-muted-foreground">
          {filteredUsers.length} of {users.length} users shown
        </p>
      </div>

      {/* User List Container */}
      <UserContainer
        users={filteredUsers}
        containerTitle=""
        UserComponent={UserComponent}
      />
    </div>
  );
}