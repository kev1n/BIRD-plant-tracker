/**
 * User Container Component
 * 
 * Refactored for:
 * - Modern design with proper spacing and visual hierarchy
 * - Accessibility improvements with ARIA labels
 * - Mobile-first responsive design
 * - Empty state handling with better UX
 */

import { Users } from 'lucide-react';
import type { User } from '../../../types/auth';

interface UserContainerProps {
    users: User[];
    containerTitle: string;
    UserComponent: React.ComponentType<User>;
}

export default function UserContainer({ users, containerTitle, UserComponent }: UserContainerProps) {
    const isEmpty = users.length === 0;

    return (
        <div className="space-y-4">
            {/* Container Title - only show if provided */}
            {containerTitle && (
                <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-foreground">{containerTitle}</h3>
                </div>
            )}

            {/* User List */}
            <div className="min-h-[200px]">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h4 className="text-sm font-medium text-foreground mb-2">
                            No users found
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {containerTitle.toLowerCase().includes('request') 
                                ? 'There are currently no pending role requests to review.'
                                : 'No users match the current criteria.'
                            }
                        </p>
                    </div>
                ) : (
                    <div 
                        className="divide-y divide-border"
                        role="list"
                        aria-label={`List of ${users.length} user${users.length !== 1 ? 's' : ''}`}
                    >
                        {users.map((user) => (
                            <div key={user.email} role="listitem" className="p-4 hover:bg-muted/50 transition-colors">
                                <UserComponent {...user} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}