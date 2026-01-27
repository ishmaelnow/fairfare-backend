import { supabase } from './supabase';

export async function signUp(email, password, role, fullName) {
  if (role === 'admin') {
    throw new Error('Admin accounts cannot be created through signup. Please contact support.');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName || null,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: role,
      full_name: fullName || null,
    });

  if (profileError) {
    console.error('Failed to create profile:', profileError);
    throw new Error('Profile creation failed. Please try again.');
  }

  return authData;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
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

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}


