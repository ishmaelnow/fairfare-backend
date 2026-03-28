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

  // Create profile (RLS policy allows users to insert own profile)
  // Use upsert to handle case where profile might already exist
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      role: 'rider',
      full_name: fullName || null,
    }, {
      onConflict: 'id'
    });

  if (profileError) {
    // If it's a duplicate key error, profile already exists - that's okay
    if (profileError.code === '23505') {
      console.log('Profile already exists, continuing...');
    } else {
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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email,
    role: profile.role,
    full_name: profile.full_name,
    phone: profile.phone,
  };
}


