import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
//import { getMe } from './authController.js';

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

        // make sure userID is present

        // make sure user is only updating their own information
        //  This could be implicit in the endpoint structure...

        // make supabase call

        // check for errors

        // return success

    } catch(error) {
        res.status(500).json({ error: `Internal server error: ${error}`});
    } 
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
    try {
        // make sure appropriate role header is present

        // query validRoles table to make sure it's valid // we could hardcode, but meh

        // make sure we are updating a valid uuid

        // make sure the user trying to do the updating is an owner or an admin
        
        // make supabase call

        // check for errors

        // return success
        
    } catch(error) {
        res.status(500).json({ error: `Internal server error: ${error}`});
    }
}