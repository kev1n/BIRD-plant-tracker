import { AlertCircle, Upload, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import AllUsers from '@/components/admin/all-users';
import ImportContainer from '@/components/admin/plant-import-form';
import RoleRequest from '@/components/admin/role-request';
import UserContainer from '@/components/admin/user-container';
import UserRoleInfo from '@/components/admin/user-role-info';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { User } from '../../types/auth';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        
        const response = await fetch(`${baseUrl}/auth/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const userData = await response.json();

        if (!response.ok) {
          throw new Error(userData.error || 'Failed to fetch users');
        }

        setUsers(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching users');
        toast.error('Error fetching users: ' + err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Fixed: Added empty dependency array

  // Filter users with pending role requests
  const pendingRoleRequests = users.filter(user => user.roleRequested != null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Manage users, roles, and system configurations
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">User Statistics</h2>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingRoleRequests.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admins/Owners</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(user => user.role === 'admin' || user.role === 'owner').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(user => user.role === 'user').length}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Management Sections */}
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {/* Role Requests Section */}
              <section className="lg:col-span-1" aria-labelledby="role-requests-heading">
                <Card>
                  <CardHeader>
                    <CardTitle id="role-requests-heading" className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Role Requests
                    </CardTitle>
                    <CardDescription>
                      Review and approve user role change requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <UserContainer 
                      users={pendingRoleRequests} 
                      containerTitle=""
                      UserComponent={RoleRequest}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* All Users Section */}
              <section className="lg:col-span-1" aria-labelledby="all-users-heading">
                <Card>
                  <CardHeader>
                    <CardTitle id="all-users-heading" className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Search and manage all registered users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AllUsers 
                      users={users} 
                      containerTitle=""
                      UserComponent={UserRoleInfo}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* Import Section */}
              <section className="lg:col-span-2 xl:col-span-1" aria-labelledby="import-heading">
                <Card>
                  <CardHeader>
                    <CardTitle id="import-heading" className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Data Import
                    </CardTitle>
                    <CardDescription>
                      Import plant data and manage bulk operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ImportContainer />
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
