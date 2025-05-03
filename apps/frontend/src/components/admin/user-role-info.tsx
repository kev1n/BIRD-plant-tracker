import { Button } from "../ui/button";
import { User } from "types/auth";

// TODO: ABSTRACT updateRole into a separate file so that we don't have replicas in 
// both user-role-info.tsx and role-request.tsx !!!

let role = 'user';

async function updateRole(email: string, approved: boolean){

    if (approved){
      role = 'editor';
    } 
  
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/role/${email}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: `${role}`,
        })
      });
  
      if (!response.ok){
        throw new Error('Failed to update user role');
      }
    } catch (err){
      console.error('Error updating user:', err);
    }
}


export default function UserRoleInfo(props: User){
    return (
      <div className="p-2 m-2 grid grid-cols-[minmax(100px,1fr)_auto] items-center border border-gray-700 rounded-[3px]">
        <p className="text-left">{props.username}</p>
        <p>{props.role}</p>
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