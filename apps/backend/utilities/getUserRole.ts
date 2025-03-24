import supabase from '../config/supabase.js';

// Take a user ID from supabase users table, return the role of the user
export default async function getUserRole(userID: string): Promise<string> {
  const { data, error } = await supabase.from('users').select('role').eq('userID', userID).single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.role || '';
}
