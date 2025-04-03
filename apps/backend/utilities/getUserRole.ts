import supabase from '../config/supabase.js';

// Take a user ID from supabase users table, return the role of the user
export default async function getUserRole(userID: string): Promise<string> {
    try {
        const { data, error } = await supabase.from('users').select('role').eq('userID', userID).single();

        if (error) {
            // error querying DB, return empty string to indicate no role found
            return '';
        }
        
        return data?.role || '';
    } 
    catch {
        // unexpected error, return empty string to indicate no role found
        return '';
    }
}
