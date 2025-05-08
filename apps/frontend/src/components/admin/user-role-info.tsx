import { Button } from "../ui/button";
import { useState } from "react";
import { User } from "types/auth";
import { useUser } from "@/hooks/useUser";
import { updateRole, updateAdmin } from "../../lib/admin-utils"; 
import UserPopup from './user-popup';

// A more comprehensive component for adding and revoking user role privileges,
// and for discovering additional information about a user.
export default function UserRoleInfo(props: User) { 
  const [showPopup, setShowPopup] = useState(false); 
  const userContext = useUser();
  const myUser = userContext.user;

  return (
    <div className="p-2 m-2 grid grid-cols-[minmax(100px,1fr)_auto] items-center border border-gray-700 rounded-[3px]">
      <p className="text-left font-semibold">
        {props.username} {myUser && (props.email === myUser.email) ? "(YOU)" : ""}</p>
      <p>{props.role}</p>

      <div className="flex items-center space-x-4">
        <Button 
          variant="gray"
          onClick={() => setShowPopup(!showPopup)}
        >
          More Info
        </Button>

        {myUser && props.email !== myUser.email && props.role === 'user' && (
          <Button
            variant="lightGreen"
            onClick={() => updateRole(props.email, true)}
            className="hover:shadow-lg"
          >
            ALLOW EDITING
          </Button>
        )}

        {myUser && props.email !== myUser.email && props.role === 'editor' && (
          <Button
            variant="darkGreen"
            onClick={() => updateRole(props.email, false)}
            className="hover:shadow-lg"
          >
            REMOVE EDITING
          </Button>
        )}

        {myUser && props.email !== myUser.email && myUser.role === "owner" &&
         props.role !== 'admin' && props.role !== 'owner' && (
          <Button
            variant="lightGreen"
            onClick={() => updateAdmin(props.email, true)}
            className="hover:shadow-lg"
          >
            MAKE ADMIN
          </Button>
        )}

        {myUser && props.email !== myUser.email && props.role === 'admin' && 
         myUser.role === "owner" && (
          <Button
            variant="darkGreen"
            onClick={() => updateAdmin(props.email, false)}
            className="hover:shadow-lg"
          >
            REVOKE ADMIN
          </Button>
        )}
      </div>

      {showPopup && (
        <div className="mt-2 col-span-2">
          <UserPopup {...props} />
        </div>
      )}
  
    </div>
  );
}