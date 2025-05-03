import { Button } from "@/components/ui/button";

let role = 'user';

interface RoleProps{
  username: string;
  email: string;
}

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


export default function RoleRequest(props: RoleProps){
  return (
    <div>
      <p>{props.username}</p>
      <Button variant={'white'}>MORE</Button>
      <Button variant={'lightGreen'} onClick={() => updateRole(props.email, true)}>ALLOW EDITING</Button>
      <Button variant={'darkGreen'} onClick={() => updateRole(props.email, false)}>DENY</Button>
    </div>
  );
}
