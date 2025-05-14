import { Button } from "../ui/button";
import { User } from "types/auth";
import { updateRole, updateAdmin } from "../../lib/admin-utils"; 

export default function UserRoleInfo(props: User) {  
  return (
      <div className="p-2 m-2 grid grid-cols-[minmax(100px,1fr)_auto] items-center border border-gray-700 rounded-[3px]">
        <p>{props.username}</p>
        <p>{props.role}</p>
        <div className="flex items-center space-x-4">
          {props.role === 'user' && (
            <Button
              variant="lightGreen"
              onClick={() => updateRole(props.email, true)}
              className="hover:shadow-lg"
            >
              ALLOW EDITING
            </Button>
          )}
          {props.role === 'editor' && (
            <Button
              variant="darkGreen"
              onClick={() => updateRole(props.email, false)}
              className="hover:shadow-lg"
            >
              REMOVE EDITING
            </Button>
          )}
          {props.role !== 'admin' && props.role !== 'owner' && (
            <Button
              variant="lightGreen"
              onClick={() => updateAdmin(props.email, true)}
              className="hover:shadow-lg"
            >
              MAKE ADMIN
            </Button>
          )}
          {props.role === 'admin' && (
            <Button
              variant="darkGreen"
              onClick={() => updateAdmin(props.email, false)}
              className="hover:shadow-lg"
            >
              REVOKE ADMIN
            </Button>
          )}
        </div>
      </div>
    );
  }