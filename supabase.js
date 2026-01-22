import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for database operations
export const supabaseHelpers = {
  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    return { data, error };
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  },

  // Groups
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

  // Expenses
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
  }
};
