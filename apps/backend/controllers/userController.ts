import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { UpdateUserBody } from '../types.js';

export async function getUserByID(req: Request, res: Response): Promise<void> {
    try {
        const userID = req.params.userid;

        if (!userID) {
            res.status(400).json({ error: "Missing userID in path params" });
            return;
        }

        const {data: user, error } = await supabase
            .from('users')
            .select('userID, email, username, firstname, lastname, role')
            .eq('userID', userID)
            .single();
        
        if (error) {
            res.status(400).json({ error: `Supabase error: ${error.message}` });
            return;
        }

        if (!user) {
            res.status(400).json({ error: "No user found" });
        }

        res.status(200).json(user)

    } catch(error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}

export async function getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
        const email = req.params.email;

        if (!email) {
            res.status(400).json({ error: 'Missing user email' });
            return;
        }
        
        const { data: user, error} = await supabase
            .from('users')
            .select('userID, email, username, firstname, lastname, role')
            .eq('email', email)
            .single();

        if (error) {
            res.status(400).json({ error: `Supabase error: ${error.message}` });
            return;
        }

        if (!user) {
            res.status(400).json({ error: 'No user found' });
            return;
        }

        res.status(200).json(user);

    } catch(error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}

export async function updateUserPersonalInfo(req: Request, res: Response): Promise<void> {
    try {
        // make sure appropriate headers are present
        const { username, email, firstname, lastname } = req.body;

        const updates: UpdateUserBody = {};

        if (username !== undefined) updates.username = username;
        if (email !== undefined) updates.email = email;
        if (firstname !== undefined) updates.firstname = firstname;
        if (lastname !== undefined) updates.lastname = lastname;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields provided to update' });
            return;
        }

        // extract token
        const token =
        req.cookies?.session ||
        req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // fetch the user
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser(token);

        if (userError || !user) {
            res.status(401).json({ error: 'Authentication failed' });
            return;
        }

        // make supabase update call
        const { data: userData, error } = await supabase
            .from('users')
            .update(updates)
            .eq('userID', user.id)
            .select()
            .single(); 

        if (error) {
            res.status(400).json({ error: `Supabase error: ${error.message}` });
            return;
        }

        if (!userData) {
            res.status(400).json({ error: 'No user data found to update' });
        }

        res.status(200).json({ message: `User updated successfully.` });

    } catch(error) {
        res.status(500).json({ error: `Internal server error: ${error}`});
    } 
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
    try {
        // make sure appropriate role header and email param present
        const { role } = req.body;
        const { email } = req.params;

        if (!role) {
            res.status(400).json({ error: 'Missing required role header' });
            return;
        }

        if (!email) {
            res.status(400).json({ error: 'Missing email in path parameters'});
            return;
        }

        // query validRoles table to make sure it's valid 
        // we could hardcode this but I'm trying to think modularly
        const { data: roleData, error: roleError } = await supabase
            .from('ValidRoles')
            .select()
            .eq('role', role)
            .single();
        
        if (roleError) {
            res.status(400).json({ error: `Supabase error: ${roleError.message}` });
        }

        if (!roleData) {
            res.status(400).json({ error: 'Invalid role type' });
        }

        // make sure the user trying to do the updating is an owner or an admin
        // extract token from cookies or auth header
        const token =
          req.cookies?.session ||
          req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // fetch the updater user from auth
        const { data: { user } , error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            res.status(401).json({ error: 'Authentication failed' });
            return;
        }

        // fetch the updater details from the users table using the auth user's id
        const { data: updaterData, error: updaterTableError } = await supabase
            .from('users')
            .select('role')
            .eq('userID', user.id)
            .single();

        if (updaterTableError || !updaterData) {
            res.status(401).json({ error: 'Failed to retrieve updater user details' });
            return;
        }
        const updater = { ...user, ...updaterData };

        // updater must be either owner or admin
        const allowedUpdaterRoles = ['owner', 'admin'];

        if (!allowedUpdaterRoles.includes(updater.role)) {
            res.status(403).json({ error: 'Insufficient authority to update roles' });
            return;
        }

        // fetch the target user's current role using their email
        const { data: targetUser, error: targetUserError } = await supabase
            .from('users')
            .select('role')
            .eq('email', email)
            .single();

        if (targetUserError || !targetUser) {
            res.status(400).json({ error: 'Target user not found' });
            return;
        }

        // make sure the user's current and new roles are both below updater's authority level
        // define a simple hierarchy: owner (3) > admin (2) > user (1)
        const roleHierarchy: Record<string, number> = {
            owner: 3,
            admin: 2,
            user: 1
        };

        const updaterAuthority = roleHierarchy[updater.role] ?? 0;
        const targetCurrentAuthority = roleHierarchy[targetUser.role] ?? 0;
        const newRoleAuthority = roleHierarchy[role as string] ?? 0;

        // one nice thing about this is that it also prevents users from updating their own role.
        // your role == your role, so no updating it.
        if (updaterAuthority <= targetCurrentAuthority || updaterAuthority <= newRoleAuthority) {
            res.status(403).json({ error: 'Insufficient authority to update the user role' });
            return;
        }

        // make supabase call
        const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ role: role, roleRequested: null }) // also erase any requested roles
            .eq('email', email)
            .select()
            .single();

        if (updateError) {
            res.status(400).json({ error: `Supabase erorr: ${updateError.message}`});
            return;
        }

        if (!updateData) {
            res.status(400).json({ error: 'No user data returned'})
        }

        res.status(200).json({ message: 'User role updated successfully' });
        
    } catch(error) {
        res.status(500).json({ error: `Internal server error: ${error}`});
    }
}