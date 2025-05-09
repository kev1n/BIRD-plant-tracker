import { Button } from "@/components/ui/button";
import type { User } from '../../../types/auth';
import { updateRole } from '../../lib/admin-utils';




export default function RoleRequest(props: User){
  return (
    <div className="p-2 m-2 grid grid-cols-[minmax(100px,1fr)_auto] items-center border border-gray-700 rounded-[3px]">
      <p className="text-left">{props.username}</p>
      <div className="flex items-center space-x-4">
        <Button variant="white" className="hover:shadow-lg">MORE</Button>
        <Button
          variant="lightGreen"
          onClick={() => updateRole(props.email, true)}
          className="ml-8 hover:shadow-lg"
        >
          ALLOW EDITING
        </Button>
        <Button
          variant="darkGreen"
          onClick={() => updateRole(props.email, false)}
          className="hover:shadow-lg"
        >
          DENY
        </Button>
      </div>
    </div>
  );
}
