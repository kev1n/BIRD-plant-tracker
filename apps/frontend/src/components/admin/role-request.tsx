import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { User } from '../../../types/auth';
import { updateAdmin, updateRole } from '../../lib/admin-utils';
import UserPopup from "./user-popup";
import RoleConfirmationDialog from "./role-confirmation-dialog";

// card for granting RoleRequests for a particular user
export default function RoleRequest(props: User){
  const [showPopup, setShowPopup] = useState(false); // popup card with more user info
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);

  // depending on the role our user is requesting, necessary text and function changes
  const roleMessage = props.roleRequested === "admin" ? "ADMIN" : "EDITING";
  const updateFunc = props.roleRequested === "admin" ? updateAdmin : updateRole;

  return (
    <div className="p-2 m-2 grid grid-cols-[minmax(100px,1fr)_auto] items-center border border-gray-700 rounded-[3px]">
      <p className="text-left font-semibold">{props.username}</p>
      <p>{props.role}</p>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="gray"
          onClick={() => setShowPopup(!showPopup)}
        >
          More Info
        </Button>

        <Button
          variant="lightGreen"
          onClick={() => setShowConfirmDialog(true)}
          className="hover:shadow-lg"
        >
          ALLOW {roleMessage}
        </Button>

        <Button
          variant="darkGreen"
          onClick={() => setShowDenyDialog(true)}
          className="hover:shadow-lg bg-[#BB0030] hover:bg-[#800000]"
        >
          DENY
        </Button>
      </div>

      <RoleConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        message={`Are you sure you want to grant ${roleMessage} permissions?`}
        onConfirm={() => updateFunc(props.email, true)}
      />

      <RoleConfirmationDialog
        open={showDenyDialog}
        onOpenChange={setShowDenyDialog}
        message={`Are you sure you want to deny ${roleMessage} permissions?`}
        onConfirm={() => updateFunc(props.email, false)}
      />

      {showPopup && (
          <div className="mt-2 col-span-2">
            <UserPopup {...props} />
          </div>
      )}

    </div>
  );
}
