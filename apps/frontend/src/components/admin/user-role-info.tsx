/**
 * User Role Information Component
 * 
 * Refactored for:
 * - Modern card-based design with better visual hierarchy
 * - Mobile-first responsive layout with collapsible actions
 * - Better accessibility with proper ARIA labels and semantic HTML
 * - Improved button variants and status indicators
 * - Avatar display and status badges
 */

import { Crown, MoreHorizontal, Shield, ShieldCheck, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useUser } from "@/hooks/useUser";
import type { User } from "types/auth";
import { updateAdmin, updateRole } from "../../lib/admin-utils";
import RoleConfirmationDialog from "./role-confirmation-dialog";
import UserPopup from './user-popup';

interface UserRoleInfoProps extends User {
  onUpdateUser?: (email: string, newRole: string, wasRoleRequest?: boolean) => void;
}

export default function UserRoleInfo(props: UserRoleInfoProps) {
  const { user: currentUser } = useUser();
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  
  const isCurrentUser = currentUser?.email === props.email;
  const canManageUser = !isCurrentUser && (currentUser?.role === 'admin' || currentUser?.role === 'owner');
  const isOwner = currentUser?.role === 'owner';

  // Generate user initials for avatar
  const getInitials = (firstname?: string, lastname?: string, username?: string) => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleRoleUpdate = async (email: string, approved: boolean, isAdminRole: boolean = false) => {
    try {
      const updateFunc = isAdminRole ? updateAdmin : updateRole;
      const success = await updateFunc(email, approved);
      
      if (success) {
        const roleType = isAdminRole ? 'Admin' : 'Editor';
        const action = approved ? 'granted' : 'revoked';
        
        // Calculate the new role based on the update
        let newRole: string;
        if (isAdminRole) {
          newRole = approved ? 'admin' : 'editor';
        } else {
          newRole = approved ? 'editor' : 'user';
        }
        
        toast.success(`${roleType} permissions ${action} for ${props.username}`);
        
        // Update the specific user
        if (props.onUpdateUser) {
          props.onUpdateUser(email, newRole, false);
        }
      } else {
        const roleType = isAdminRole ? 'admin' : 'editor';
        const action = approved ? 'grant' : 'revoke';
        toast.error(`Failed to ${action} ${roleType} permissions`);
      }
    } catch (error) {
      toast.error(`Error updating role: ${error}`);
    }
  };

  // Get role-specific styling and icons
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'owner':
        return { 
          variant: 'success' as const, 
          icon: Crown, 
          label: 'Owner' 
        };
      case 'admin':
        return { 
          variant: 'info' as const, 
          icon: ShieldCheck, 
          label: 'Admin' 
        };
      case 'editor':
        return { 
          variant: 'warning' as const, 
          icon: Shield, 
          label: 'Editor' 
        };
      default:
        return { 
          variant: 'secondary' as const, 
          icon: UserIcon, 
          label: 'User' 
        };
    }
  };

  const roleInfo = getRoleInfo(props.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="space-y-0">
      {/* Main User Info Row */}
      <div className="flex items-center justify-between p-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(props.firstname, props.lastname, props.username)}
            </AvatarFallback>
          </Avatar>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-sm text-foreground truncate">
                {props.firstname && props.lastname 
                  ? `${props.firstname} ${props.lastname}`
                  : props.username
                }
              </h4>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">You</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={roleInfo.variant} className="text-xs">
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleInfo.label}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                @{props.username}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* More Info Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls={`user-details-${props.email}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle user details</span>
          </Button>

          {/* Role Management Buttons - only for mobile/tablet, hidden on desktop */}
          {canManageUser && (
            <div className="flex space-x-1 lg:hidden">
              {props.role === 'user' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="text-xs"
                >
                  Promote
                </Button>
              )}
              {props.role === 'editor' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="text-xs"
                >
                  Demote
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details Section */}
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CollapsibleContent id={`user-details-${props.email}`}>
          <div className="pt-4 space-y-4">
            {/* User Popup Details */}
            <UserPopup {...props} />

            {/* Role Management Actions - Desktop Layout */}
            {canManageUser && (
              <div className="hidden lg:flex flex-wrap gap-2 pt-2 border-t">
                {/* Editor Role Management */}
                {props.role === 'user' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Grant Editor Access</span>
                  </Button>
                )}

                {props.role === 'editor' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Revoke Editor Access</span>
                  </Button>
                )}

                {/* Admin Role Management - Owner Only */}
                {isOwner && props.role !== 'admin' && props.role !== 'owner' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowAdminDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Grant Admin Access</span>
                  </Button>
                )}

                {isOwner && props.role === 'admin' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowAdminDialog(true)}
                    className="flex items-center space-x-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Revoke Admin Access</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Confirmation Dialogs */}
      <RoleConfirmationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        message={
          props.role === 'user' 
            ? "Are you sure you want to grant editing permissions to this user?" 
            : "Are you sure you want to revoke editing permissions from this user?"
        }
        onConfirm={() => handleRoleUpdate(props.email, props.role === 'user', false)}
      />

      <RoleConfirmationDialog
        open={showAdminDialog}
        onOpenChange={setShowAdminDialog}
        message={
          props.role === 'admin'
            ? "Are you sure you want to revoke admin permissions from this user?"
            : "Are you sure you want to grant admin permissions to this user?"
        }
        onConfirm={() => handleRoleUpdate(props.email, props.role !== 'admin', true)}
      />
    </div>
  );
}