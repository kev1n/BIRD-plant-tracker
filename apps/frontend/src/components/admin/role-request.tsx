/**
 * Role Request Component
 * 
 * Refactored for:
 * - Card-appropriate layout for desktop view
 * - Compact design that works well in constrained widths
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
    <div className="border rounded-lg p-4 bg-card">
      {/* Main Request Content - Vertical Layout for Cards */}
      <div className="space-y-3">
        {/* User Info Row */}
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-sm">
              {getInitials(props.firstname, props.lastname, props.username)}
            </AvatarFallback>
          </Avatar>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-foreground">
              {props.firstname && props.lastname 
                ? `${props.firstname} ${props.lastname}`
                : props.username
              }
            </h4>
            <p className="text-xs text-muted-foreground">@{props.username}</p>
          </div>

          {/* Details Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls={`request-details-${props.email}`}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle request details</span>
          </Button>
        </div>

        {/* Badges Row - Full Width */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            Current: {props.role}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Requesting {roleMessage}
          </Badge>
        </div>

        {/* Action Buttons - Full Width for Card Layout */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className="flex-1 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDenyDialog(true)}
            className="flex-1 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Deny
          </Button>
        </div>
      </div>

      {/* Expandable Details Section */}
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CollapsibleContent id={`request-details-${props.email}`}>
          <div className="pt-4 mt-4 border-t space-y-4">
            <UserPopup {...props} />
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
