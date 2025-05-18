// methods for components on the admin page to make requests 
// to update user roles

// update a user between editor and user (for RoleRequest components)
async function updateRole(email: string, approved: boolean) {
    const newRole = approved ? 'editor' : 'user';
  
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/role/${email}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: newRole,
        })
      });
  
      if (!response.ok){
        throw new Error('Failed to update user role');
      }
    } catch (err){
      console.error('Error updating user:', err);
    }
}

// Update a user between editor and admin (for UserRoleInfo components)

async function updateAdmin(email:string, approved: boolean) {
    const newRole = approved ? 'admin' : 'editor';
  
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/role/${email}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: newRole,
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update admin role');
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
}

async function sendCSV(formData:FormData){
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to import plant data to database');
    }

    return response.json();
  } catch (err) {
    console.error('Error uploading CSV:', err);
  }
}

export { sendCSV, updateAdmin, updateRole };
