import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { User } from '../../../types/auth';
import { updateRole } from '../../lib/admin-utils';
import UserPopup from "./user-popup";



export default function RoleRequest(props: User){
  const [showPopup, setShowPopup] = useState(false); // popup card with more user info
  
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
          onClick={() => updateRole(props.email, true)}
          className="ml-8 hover:shadow-lg"
        >
          ALLOW {props.roleRequested === "admin" ? "ADMIN" : "EDITING"}
        </Button>
        <Button
          variant="darkGreen"
          onClick={() => updateRole(props.email, false)}
          className="hover:shadow-lg"
        >
          DENY
        </Button>
      </div>

      {showPopup && (
          <div className="mt-2 col-span-2">
            <UserPopup {...props} />
          </div>
      )}

    </div>
  );
}
