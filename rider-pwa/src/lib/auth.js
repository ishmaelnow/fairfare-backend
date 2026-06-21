import { supabase } from './supabase';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export async function signUp(email, password, fullName) {
  const safeEmail = normalizeEmail(email);
  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: safeEmail,
    password,
    options: {
      data: {
        role: 'rider',
        full_name: fullName || null,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  // Only attempt profile upsert if we have an active session.
  // When email confirmation is required, authData.session is null and RLS
  // blocks unauthenticated inserts (401). In that case the DB trigger
  // handle_new_user() creates the profile automatically.
  if (authData.session) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        role: 'rider',
        full_name: fullName || null,
      }, {
        onConflict: 'id'
      });

    if (profileError && profileError.code !== '23505') {
      console.error('Failed to create profile:', profileError);
      throw new Error('Profile creation failed. Please try again.');
    }
  }

  return authData;
}

export async function signIn(email, password) {
  const safeEmail = normalizeEmail(email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: safeEmail,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email, redirectPath = '/reset-password') {
  const safeEmail = normalizeEmail(email);
  const redirectTo = `${window.location.origin}${redirectPath}`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(safeEmail, {
    redirectTo,
  });

  if (error) throw error;
  return data;
}

export async function exchangeRecoveryCode(code) {
  if (!code) {
    throw new Error('Missing recovery code.');
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return data;
}

export async function updatePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileLookupError) throw profileLookupError;

  let profile = existingProfile;

  // OAuth users may not have a profile if the database trigger is absent or
  // still running. Create only a missing Rider profile; never overwrite an
  // existing Driver or Admin role.
  if (!profile) {
    const { data: createdProfile, error: profileInsertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        role: 'rider',
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      })
      .select('*')
      .single();

    if (profileInsertError?.code === '23505') {
      const { data: concurrentProfile, error: concurrentLookupError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (concurrentLookupError) throw concurrentLookupError;
      profile = concurrentProfile;
    } else if (profileInsertError) {
      throw profileInsertError;
    } else {
      profile = createdProfile;
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: profile.role,
    full_name: profile.full_name,
    phone: profile.phone,
  };
}
