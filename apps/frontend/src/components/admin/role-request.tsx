/**
 * Role Request Component
 * 
 * Refactored for:
 * - Smaller, appropriate text sizes (text-sm, text-xs)
 * - Modern card-based design with better spacing
 * - Improved visual hierarchy and button layout
 * - Mobile-first responsive design
 * - Consistent design system integration
 */

import { AlertTriangle, Check, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import type { User } from '../../../types/auth';
import { updateAdmin, updateRole } from '../../lib/admin-utils';
import RoleConfirmationDialog from "./role-confirmation-dialog";
import UserPopup from "./user-popup";

// card for granting RoleRequests for a particular user
export default function RoleRequest(props: User) {
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);

  // depending on the role our user is requesting, necessary text and function changes
  const roleMessage = props.roleRequested === "admin" ? "Admin" : "Editor";
  const updateFunc = props.roleRequested === "admin" ? updateAdmin : updateRole;

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

  return (
    <div className="space-y-0">
      {/* Main Request Row */}
      <div className="flex items-center justify-between p-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Avatar */}
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-xs">
              {getInitials(props.firstname, props.lastname, props.username)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-sm text-foreground truncate">
                {props.firstname && props.lastname 
                  ? `${props.firstname} ${props.lastname}`
                  : props.username
                }
              </h4>
              <Badge variant="warning" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Requesting {roleMessage}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Current: {props.role}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                @{props.username}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Details Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls={`request-details-${props.email}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle request details</span>
          </Button>

          {/* Approve Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-3 w-3 md:mr-1" />
            <span className="hidden md:inline">Approve</span>
          </Button>

          {/* Deny Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDenyDialog(true)}
          >
            <X className="h-3 w-3 md:mr-1" />
            <span className="hidden md:inline">Deny</span>
          </Button>
        </div>
      </div>

      {/* Expandable Details Section */}
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CollapsibleContent id={`request-details-${props.email}`}>
          <div className="pt-4 space-y-4">
            <UserPopup {...props} />
            
            {/* Desktop Action Buttons */}
            <div className="hidden md:flex justify-end space-x-2 pt-2 border-t">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowConfirmDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve {roleMessage} Request
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDenyDialog(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Deny Request
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Confirmation Dialogs */}
      <RoleConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        message={`Are you sure you want to grant ${roleMessage} permissions to ${props.username}?`}
        onConfirm={() => updateFunc(props.email, true)}
      />

      <RoleConfirmationDialog
        open={showDenyDialog}
        onOpenChange={setShowDenyDialog}
        message={`Are you sure you want to deny the ${roleMessage} request from ${props.username}?`}
        onConfirm={() => updateFunc(props.email, false)}
      />
    </div>
  );
}
