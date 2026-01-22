import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://livinwsodaxjasdnrohx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpdmlud3NvZGF4amFzZG5yb2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTAzODksImV4cCI6MjA4NDY2NjM4OX0.Ai-YXtiiq7Bh9Oufr0tvAKnjGIwoGRTYsnItiLl80e4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication helpers
export const authHelpers = {
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const dbHelpers = {
  async createGroup(groupData) {
    const { data, error } = await supabase
      .from('groups')
      .insert([groupData])
      .select();
    return { data, error };
  },

  async getUserGroups(userId) {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        groups!inner(
          id,
          name,
          description,
          created_by,
          created_at
        )
      `)
      .eq('user_id', userId);
    return { data, error };
  },

  async createExpense(expenseData) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select();
    return { data, error };
  },

  async getGroupExpenses(groupId) {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by:users(username, email),
        splits!inner(
          amount,
          user:users(username, email)
        )
      `)
      .eq('group', groupId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addGroupMember(groupId, userId) {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userId
      }])
      .select();
    return { data, error };
  },

  async removeGroupMember(groupId, userId) {
    const { data, error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    return { data, error };
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }
};
