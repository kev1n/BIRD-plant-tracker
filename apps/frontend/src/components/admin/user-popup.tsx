/**
 * User Details Popup Component
 * 
 * Refactored for:
 * - Smaller, appropriate text sizes (text-sm, text-xs)
 * - Modern styling with proper spacing and colors
 * - Consistent design system integration
 * - Better visual hierarchy
 */

import { Badge } from '@/components/ui/badge';
import { AlertCircle, Mail, Shield, User as UserIcon } from 'lucide-react';
import type { User } from "types/auth";

export default function UserPopup(props: User) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {/* User Name */}
      {props.firstname && props.lastname ? (
        <div className="flex items-center space-x-2 mb-3">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <h5 className="text-sm font-medium text-foreground">
            {props.firstname} {props.lastname}
          </h5>
        </div>
      ) : (
        <div className="flex items-center space-x-2 mb-3">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <h5 className="text-sm font-medium text-foreground">
            {props.username}
          </h5>
        </div>
      )}

      {/* User Details */}
      <div className="space-y-2">
        {/* Email */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Email</span>
          </div>
          <span className="text-xs font-medium text-foreground">{props.email}</span>
        </div>

        {/* Current Role */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Current Role</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {props.role}
          </Badge>
        </div>

        {/* Role Requested */}
        {props.roleRequested && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Requested Role</span>
            </div>
            <Badge variant="warning" className="text-xs">
              {props.roleRequested}
            </Badge>
          </div>
        )}

        {/* Username */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Username</span>
          </div>
          <span className="text-xs font-medium text-foreground">@{props.username}</span>
        </div>
      </div>
    </div>
  );
}