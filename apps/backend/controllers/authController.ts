import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import {
  AuthRequest,
  LoginBody,
  PasswordResetBody,
  SignupBody,
  TokenBody,
  UpdatePasswordBody,
} from '../types.js';

export async function signup(
  req: Request<object, object, SignupBody>,
  res: Response
): Promise<void> {
  try {
    const { email, password, username, firstname, lastname } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({
        error: 'Email, password, and username are required',
      });
      return;
    }

    const { error: authError, data: data } = await supabase.auth.signUp({
      email,
      password,
    });
    const userID = data.user?.id;

    if (authError) {
      res.status(400).json({ error: authError.message });
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          userID,
          username,
          email,
          firstname: firstname || null,
          lastname: lastname || null,
        },
      ])
      .select()
      .single();

    if (userError) {
      res.status(400).json({ error: userError.message });
      return;
    }

    res.status(201).json({
      message: 'User created successfully',
      user: userData,
    });
  } catch (signupError) {
    // console.error('Signup error:', error);
    res.status(500).json({ error: `Internal server error: ${signupError}` });
  }
}

export async function login(req: Request<object, object, LoginBody>, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required',
      });
      return;
    }

    // console.log('Got email and passwordHash', email, password);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    // console.log('Got data', data);

    res.cookie('session', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600 * 1000,
      path: '/',
    });

    res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
    });
  } catch {
    // console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.session || req.headers.authorization?.split(' ')[1];

    // console.log('GetMe called with token:', token ? 'present' : 'missing');

    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!token.includes('.') || token.split('.').length !== 3) {
      // console.log('Token format invalid:', token);
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    // console.log('GetMe Supabase auth result:', { user, error: userError });

    if (userError || !user) {
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, username, email, firstname, lastname')
      .eq('email', user.email)
      .single();

    // console.log('GetMe database query result:', { userData, error: dbError });

    if (userData && !dbError) {
      res.json(userData);
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.email?.split('@')[0] || 'user',
    });
  } catch (error) {
    // console.error('ME endpoint error:', error);
    res.status(500).json({ error: `Authentication failed: ${error}'` });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('session');
  await supabase.auth.signOut();
  res.json({ message: 'Logged out successfully' });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const token_hash = req.query.token_hash as string;
    const type = req.query.type as string;

    if (!token_hash || type !== 'signup') {
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=invalid_verification`);
      return;
    }

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'signup',
    });

    if (verifyError || !data.session) {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?error=${encodeURIComponent(
          verifyError?.message || 'Invalid session'
        )}`
      );
      return;
    }

    const queryParams = new URLSearchParams({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in.toString(),
      type: 'signup',
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${queryParams.toString()}`);
  } catch {
    // console.error('Email verification error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=server_error`);
  }
}

export async function getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    // console.log('Getting all users...');
    const { data: users, error } = await supabase
      .from('users')
      .select('username, email, firstname, lastname')
      .order('username', { ascending: true });

    if (error) {
      // console.error('Error fetching users:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    // console.error('Get all users error:', error);
    res.status(500).json({ error: `Internal server error: ${error}'` });
  }
}

export async function googleAuth(_req: Request, res: Response): Promise<void> {
  try {
    // console.log('Starting Google auth');
    const {
      data: { url },
      error: oauthError,
    } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      },
    });

    if (oauthError) throw oauthError;

    // console.log('Generated OAuth URL:', url);
    res.json({ url });
  } catch (error) {
    // console.error('Google auth error:', error);
    res.status(500).json({ error: `Failed to initialize Google auth: ${error}'` });
  }
}

export async function handleOAuthCallback(req: Request, res: Response): Promise<void> {
  try {
    // console.log('OAuth callback received:', req.query);
    const code = req.query.code as string;

    if (!code) {
      throw new Error('No code provided');
    }

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.user || !data.session) {
      throw exchangeError || new Error('Invalid user or session data');
    }

    const { session, user } = data;
    // console.log('Got user:', user.email);

    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email!)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      // console.error('Error checking for existing user:', queryError);
      throw queryError;
    }

    if (!existingUser) {
      // console.log('Creating new user in users table...');
      const newUser = {
        username: user.email!.split('@')[0],
        email: user.email,
        firstname: user.user_metadata?.given_name || null,
        lastname: user.user_metadata?.family_name || null,
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        // console.error('Error creating user:', insertError);
        throw insertError;
      }

      // console.log('Successfully created new user:', newUser);
    } else {
      // console.log('Existing user found:', existingUser);
    }

    res.cookie('session', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 1000,
      path: '/',
    });

    res.redirect(`${process.env.FRONTEND_URL}`);
  } catch (error) {
    // console.error('OAuth callback error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=` + encodeURIComponent((error as Error).message)
    );
  }
}

export async function handleToken(
  req: Request<object, object, TokenBody>,
  res: Response
): Promise<void> {
  try {
    const { access_token } = req.body;
    // console.log('Received access token in handleToken');

    if (!access_token) {
      res.status(400).json({ error: 'No access token provided' });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(access_token);

    if (userError || !user) {
      // console.error('Error getting user:', userError);
      throw userError || new Error('User data not found');
    }

    // console.log('Got user data:', user.email);

    if (!user.email) {
      throw new Error('User email is missing');
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    // console.log('Existing user check:', {
    //   exists: !!existingUser,
    //   error: existingUserError,
    // });

    if (!existingUser && existingUserError?.code === 'PGRST116') {
      // console.log('Creating new user in database...');
      const newUser = {
        username: user.email.split('@')[0],
        email: user.email,
        firstname:
          user.user_metadata?.given_name ||
          (user.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : null),
        lastname:
          user.user_metadata?.family_name ||
          (user.user_metadata?.name ? user.user_metadata.name.split(' ')[1] : null),
      };

      // too lazy to fix this - ethan
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        // console.error('Error creating user:', insertError);
        throw insertError;
      }

      // console.log('Successfully created new user:', insertedUser);
    }

    res.cookie('session', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 1000,
      path: '/',
    });

    // console.log('Set session cookie, sending response');
    res.json({ success: true });
  } catch (error) {
    // console.error('Token handling error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function requestPasswordReset(
  req: Request<object, object, PasswordResetBody>,
  res: Response
): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Email is required',
      });
      return;
    }

    const redirectTo = `${process.env.FRONTEND_URL}/auth/reset-password`;
    // console.log('Setting redirect URL:', redirectTo);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      // console.error('Password reset request error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Password reset instructions sent to email',
    });
  } catch (error) {
    // console.error('Password reset request error:', error);
    res.status(500).json({ error: `Failed to process password reset request: ${error}'` });
  }
}

export async function handlePasswordRecovery(req: Request, res: Response): Promise<void> {
  try {
    const token_hash = req.query.token_hash as string;
    const type = req.query.type as string;

    if (!token_hash || type !== 'recovery') {
      // console.log('Invalid token or type:', { token_hash, type });
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/reset-password?error=${encodeURIComponent(
          'Invalid password recovery link'
        )}`
      );
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'recovery',
    });

    if (error || !data.session) {
      // console.error('Recovery verification error:', error);
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/reset-password?error=${encodeURIComponent(
          error?.message || 'Invalid session'
        )}`
      );
      return;
    }

    const queryParams = new URLSearchParams({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      type: 'recovery',
    });

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/reset-password?${queryParams.toString()}`;
    res.redirect(redirectUrl);
  } catch {
    // console.error('Password recovery error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/reset-password?error=${encodeURIComponent(
        'Failed to process password recovery'
      )}`
    );
  }
}

export async function updatePassword(
  req: Request<object, object, UpdatePasswordBody>,
  res: Response
): Promise<void> {
  try {
    const { password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!password) {
      res.status(400).json({
        error: 'New password is required',
      });
      return;
    }

    if (!token) {
      res.status(401).json({
        error: 'Authorization token is required',
      });
      return;
    }

    const {
      // too lazy to fix this - ethan
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: { session },
      error: sessionError,
    } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    if (sessionError) {
      // console.error('Session error:', sessionError);
      res.status(401).json({ error: sessionError.message });
      return;
    }

    // Using the session to ensure it's active
    // console.log('Session established:', !!session);

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      // console.error('Password update error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Password updated successfully',
      user: data.user,
    });
  } catch (error) {
    // console.error('Password update error:', error);
    res.status(500).json({ error: `Failed to update password: ${error}'` });
  }
}
