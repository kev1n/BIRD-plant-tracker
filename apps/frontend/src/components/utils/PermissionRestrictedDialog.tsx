import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "../ui/alert-dialog";

import { useUser } from "@/hooks/useUser";
import React from "react";
import { toast } from "sonner";

export default function PermissionRestrictedDialog({ children, actionName }: { children: React.ReactNode, actionName: string }) {
  const { user } = useUser();

  // Function to request editing permissions
  const handleRequestEditing = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${baseUrl}/users/info`, {
        method: 'PUT',
        body: JSON.stringify({ roleRequested: 'editor' }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success('Editing permissions requested. Please wait for admin approval.');
      } else {
        toast.error('Failed to request editing permissions');
      }
    } catch {
      toast.error('Error requesting editing permissions');
    }
  };

  // If user has 'user' role, show permission dialog
  if (!user || user.role === 'user') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <span style={{ cursor: 'pointer' }}>
            <span style={{ pointerEvents: 'none', display: 'contents' }}>
              {children}
            </span>
          </span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <h2 className="text-lg font-semibold text-red-600">Editing Permissions Required</h2>
            <p className="text-sm text-gray-600">
              You don&apos;t have permission to {actionName}. {user?.role === 'user' && 'Your current role is "user" and this action requires editing permissions.'} {!user && 'You are not logged in.'}
            </p>
            {user && (
              <p className="text-sm text-gray-600 mt-2">
                Would you like to request editing permissions from an administrator?
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {user && (
              <AlertDialogAction onClick={handleRequestEditing}>
                  Request Editing Permissions
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // If user has proper permissions, render children normally
  return <>{children}</>;
}