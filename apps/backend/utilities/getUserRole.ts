import supabase from '../config/supabase.js';

// Take a user ID from supabase users table, return the role of the user
export default async function getUserRole(userID: string): Promise<string> {
    try {
        const { data, error } = await supabase.from('users').select('role').eq('userID', userID).single();

        if (error) {
            console.log(`Error fetching role for user ${userID}:`, error.message);
            return '';
        }
    
        return data?.role || '';
    } 
    catch (error: any) {
        console.log('Unexpected error in getUserRole:', error.message);
        return '';
    }
}
