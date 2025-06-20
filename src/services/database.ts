import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: Profile[];
  member_count?: number;
  total_expenses?: number;
  your_balance?: number;
  last_activity?: string;
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  category: string;
  paid_by: string;
  split_type: 'equal' | 'percentage' | 'exact';
  created_at: string;
  updated_at: string;
  paid_by_profile?: Profile;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
  created_at: string;
  user_profile?: Profile;
}

export interface UserBalance {
  user_id: string;
  group_id: string;
  total_paid: number;
  total_owed: number;
  net_balance: number;
}

// Groups
export const getGroups = async (): Promise<Group[]> => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Fetching groups for user:', userAuth.user.id);

  // First get groups where user is a member
  const { data: userGroups, error: groupsError } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id,
        name,
        description,
        avatar,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userAuth.user.id);

  if (groupsError) {
    console.error('Error fetching user groups:', groupsError);
    throw groupsError;
  }

  if (!userGroups || userGroups.length === 0) {
    console.log('No groups found for user');
    return [];
  }

  // Transform and enrich the data
  const enrichedGroups = await Promise.all(
    userGroups.map(async (userGroup) => {
      const group = userGroup.groups as any;
      if (!group) return null;

      console.log('Processing group:', group.id);

      // Get member count
      const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      // Get group members by joining manually
      const { data: groupMemberIds } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);

      const members: Profile[] = [];
      if (groupMemberIds && groupMemberIds.length > 0) {
        const userIds = groupMemberIds.map(gm => gm.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
        
        if (profiles) {
          members.push(...profiles);
        }
      }

      // Get total expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('group_id', group.id);

      const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      // Get user balance for this group
      const { data: balanceData } = await supabase
        .from('user_balances')
        .select('net_balance')
        .eq('group_id', group.id)
        .eq('user_id', userAuth.user.id)
        .maybeSingle();

      const yourBalance = Number(balanceData?.net_balance) || 0;

      // Get last activity
      const { data: lastExpense } = await supabase
        .from('expenses')
        .select('created_at')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastActivity = lastExpense ? 
        new Date(lastExpense.created_at).toLocaleDateString() : 
        new Date(group.created_at).toLocaleDateString();

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        created_by: group.created_by,
        created_at: group.created_at,
        updated_at: group.updated_at,
        member_count: memberCount || 0,
        total_expenses: totalExpenses,
        your_balance: yourBalance,
        last_activity: lastActivity,
        members
      };
    })
  );

  return enrichedGroups.filter(Boolean) as Group[];
};

export const createGroup = async (name: string, description: string, avatar: string, memberEmails: string[]) => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Creating group:', { name, description, avatar, memberEmails });

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([{
      name,
      description,
      avatar,
      created_by: userAuth.user.id
    }])
    .select()
    .single();

  if (groupError) {
    console.error('Error creating group:', groupError);
    throw groupError;
  }

  console.log('Group created:', group.id);

  // Add creator as member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{
      group_id: group.id,
      user_id: userAuth.user.id
    }]);

  if (memberError) {
    console.error('Error adding creator as member:', memberError);
    throw memberError;
  }

  // Add other members (if they exist as users)
  for (const email of memberEmails) {
    if (email !== userAuth.user.email) {
      console.log('Looking for user with email:', email);
      
      // Find user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        console.log('Adding member:', profile.id);
        const { error: addMemberError } = await supabase
          .from('group_members')
          .insert([{
            group_id: group.id,
            user_id: profile.id
          }]);

        if (addMemberError) {
          console.error('Error adding member:', addMemberError);
        }
      } else {
        console.log('User not found for email:', email);
      }
    }
  }

  return group;
};

// Expenses - Fixed to avoid the foreign key error
export const getRecentExpenses = async (limit: number = 10): Promise<Expense[]> => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Fetching recent expenses for user:', userAuth.user.id);

  // Get expenses from groups where user is a member
  const { data: userGroupIds } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userAuth.user.id);

  if (!userGroupIds || userGroupIds.length === 0) {
    console.log('User is not a member of any groups');
    return [];
  }

  const groupIds = userGroupIds.map(ug => ug.group_id);
  console.log('User is member of groups:', groupIds);

  // First get expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .in('group_id', groupIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (expensesError) {
    console.error('Error fetching expenses:', expensesError);
    throw expensesError;
  }

  if (!expenses || expenses.length === 0) {
    console.log('No expenses found');
    return [];
  }

  // Then get profiles for the payers
  const payerIds = [...new Set(expenses.map(expense => expense.paid_by))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', payerIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  }

  // Map expenses with profile data
  const transformedExpenses = expenses.map((expense) => {
    const profile = profiles?.find(p => p.id === expense.paid_by);
    return {
      id: expense.id,
      group_id: expense.group_id,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      paid_by: expense.paid_by,
      split_type: expense.split_type as 'equal' | 'percentage' | 'exact',
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      paid_by_profile: profile ? {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      } : undefined
    };
  });

  console.log('Fetched expenses:', transformedExpenses.length);
  return transformedExpenses;
};

export const getUserBalances = async () => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Fetching user balances for:', userAuth.user.id);

  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userAuth.user.id);

  if (error) {
    console.error('Error fetching user balances:', error);
    throw error;
  }

  const totalOwed = data
    .filter(balance => Number(balance.net_balance) < 0)
    .reduce((sum, balance) => sum + Math.abs(Number(balance.net_balance)), 0);

  const totalOwing = data
    .filter(balance => Number(balance.net_balance) > 0)
    .reduce((sum, balance) => sum + Number(balance.net_balance), 0);

  console.log('User balances:', { totalOwed, totalOwing });
  return { totalOwed, totalOwing };
};

// New functions for group details page
export const getGroupDetails = async (groupId: string): Promise<Group> => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Fetching group details for:', groupId);

  // First check if user is a member of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userAuth.user.id)
    .maybeSingle();

  if (!membership) {
    throw new Error('You are not a member of this group');
  }

  // Get group details
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError) {
    console.error('Error fetching group:', groupError);
    throw groupError;
  }

  // Get enriched data similar to getGroups
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('group_id', groupId);

  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

  const { data: balanceData } = await supabase
    .from('user_balances')
    .select('net_balance')
    .eq('group_id', groupId)
    .eq('user_id', userAuth.user.id)
    .maybeSingle();

  const yourBalance = Number(balanceData?.net_balance) || 0;

  const { data: lastExpense } = await supabase
    .from('expenses')
    .select('created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastActivity = lastExpense ? 
    new Date(lastExpense.created_at).toLocaleDateString() : 
    new Date(group.created_at).toLocaleDateString();

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    avatar: group.avatar,
    created_by: group.created_by,
    created_at: group.created_at,
    updated_at: group.updated_at,
    member_count: memberCount || 0,
    total_expenses: totalExpenses,
    your_balance: yourBalance,
    last_activity: lastActivity
  };
};

export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Fetching expenses for group:', groupId);

  // First get expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (expensesError) {
    console.error('Error fetching group expenses:', expensesError);
    throw expensesError;
  }

  if (!expenses || expenses.length === 0) {
    console.log('No expenses found for group');
    return [];
  }

  // Get profiles for the payers
  const payerIds = [...new Set(expenses.map(expense => expense.paid_by))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', payerIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  }

  // Map expenses with profile data
  const transformedExpenses = expenses.map((expense) => {
    const profile = profiles?.find(p => p.id === expense.paid_by);
    return {
      id: expense.id,
      group_id: expense.group_id,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      paid_by: expense.paid_by,
      split_type: expense.split_type as 'equal' | 'percentage' | 'exact',
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      paid_by_profile: profile ? {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      } : undefined
    };
  });

  console.log('Fetched group expenses:', transformedExpenses.length);
  return transformedExpenses;
};

export const getGroupMembers = async (groupId: string): Promise<Profile[]> => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Fetching members for group:', groupId);

  // Get member IDs first
  const { data: groupMemberIds, error: membersError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  if (membersError) {
    console.error('Error fetching group member IDs:', membersError);
    throw membersError;
  }

  if (!groupMemberIds || groupMemberIds.length === 0) {
    console.log('No members found for group');
    return [];
  }

  // Get profiles for those member IDs
  const userIds = groupMemberIds.map(gm => gm.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching member profiles:', profilesError);
    throw profilesError;
  }

  console.log('Fetched group members:', profiles?.length || 0);
  return profiles || [];
};

// Enhanced function to create expense with automatic splitting
export const createExpense = async (
  groupId: string,
  description: string,
  amount: number,
  category: string,
  splitType: 'equal' | 'percentage' | 'exact' = 'equal',
  paidBy?: string,
  customSplits?: { userId: string; amount: number; percentage?: number }[]
) => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  // Use the provided paidBy or default to current user
  const payerId = paidBy || userAuth.user.id;

  console.log('Creating expense:', { groupId, description, amount, category, splitType, payerId });

  // Create the expense
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert([{
      group_id: groupId,
      description,
      amount,
      category,
      paid_by: payerId,
      split_type: splitType
    }])
    .select()
    .single();

  if (expenseError) {
    console.error('Error creating expense:', expenseError);
    throw expenseError;
  }

  // Handle splitting
  if (splitType === 'equal') {
    // Get all group members for equal splitting
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (groupMembers && groupMembers.length > 0) {
      const splitAmount = amount / groupMembers.length;
      
      // Create splits for each member
      const splitInserts = groupMembers.map(member => ({
        expense_id: expense.id,
        user_id: member.user_id,
        amount: splitAmount
      }));

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splitInserts);

      if (splitError) {
        console.error('Error creating equal splits:', splitError);
        throw splitError;
      }
    }
  } else if (splitType === 'exact' && customSplits) {
    // Handle custom splits
    const splitInserts = customSplits.map(split => ({
      expense_id: expense.id,
      user_id: split.userId,
      amount: split.amount,
      percentage: split.percentage
    }));

    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splitInserts);

    if (splitError) {
      console.error('Error creating custom splits:', splitError);
      throw splitError;
    }
  }

  return expense;
};

// Function to get expense splits for a specific expense
export const getExpenseSplits = async (expenseId: string): Promise<ExpenseSplit[]> => {
  console.log('Fetching expense splits for:', expenseId);

  // First get the splits
  const { data: splits, error } = await supabase
    .from('expense_splits')
    .select('*')
    .eq('expense_id', expenseId);

  if (error) {
    console.error('Error fetching expense splits:', error);
    throw error;
  }

  if (!splits || splits.length === 0) {
    return [];
  }

  // Get the user profiles separately
  const userIds = splits.map(split => split.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles for splits:', profilesError);
  }

  return splits.map(split => ({
    id: split.id,
    expense_id: split.expense_id,
    user_id: split.user_id,
    amount: Number(split.amount),
    percentage: split.percentage ? Number(split.percentage) : undefined,
    created_at: split.created_at,
    user_profile: profiles?.find(p => p.id === split.user_id) ? {
      id: profiles.find(p => p.id === split.user_id)!.id,
      name: profiles.find(p => p.id === split.user_id)!.name,
      email: profiles.find(p => p.id === split.user_id)!.email,
      avatar_url: profiles.find(p => p.id === split.user_id)!.avatar_url,
      created_at: profiles.find(p => p.id === split.user_id)!.created_at,
      updated_at: profiles.find(p => p.id === split.user_id)!.updated_at
    } : undefined
  }));
};

// Function to get user balances for a specific group
export const getGroupBalances = async (groupId: string): Promise<UserBalance[]> => {
  console.log('Fetching group balances for:', groupId);

  const { data: balances, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching group balances:', error);
    throw error;
  }

  return balances?.map(balance => ({
    user_id: balance.user_id!,
    group_id: balance.group_id!,
    total_paid: Number(balance.total_paid) || 0,
    total_owed: Number(balance.total_owed) || 0,
    net_balance: Number(balance.net_balance) || 0
  })) || [];
};

// Function to add member to group
export const addGroupMember = async (groupId: string, email: string) => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Adding member to group:', { groupId, email });

  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!profile) {
    throw new Error('User not found with this email');
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (existingMember) {
    throw new Error('User is already a member of this group');
  }

  // Add member to group
  const { error } = await supabase
    .from('group_members')
    .insert([{
      group_id: groupId,
      user_id: profile.id
    }]);

  if (error) {
    console.error('Error adding member:', error);
    throw error;
  }

  return profile;
};

// Function to remove member from group
export const removeGroupMember = async (groupId: string, userId: string) => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Removing member from group:', { groupId, userId });

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// Function to delete expense
export const deleteExpense = async (expenseId: string) => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Deleting expense:', expenseId);

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Function to update expense
export const updateExpense = async (
  expenseId: string,
  updates: {
    description?: string;
    amount?: number;
    category?: string;
  }
) => {
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error('User not authenticated');

  console.log('Updating expense:', { expenseId, updates });

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }

  return data;
};

// Function to get expense analytics for a group
export const getGroupAnalytics = async (groupId: string) => {
  console.log('Fetching analytics for group:', groupId);

  // Get all expenses for the group
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId);

  if (expensesError) {
    console.error('Error fetching expenses for analytics:', expensesError);
    throw expensesError;
  }

  // Calculate analytics
  const totalAmount = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  
  const categoryTotals = expenses?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const monthlyTotals = expenses?.reduce((acc, exp) => {
    const month = new Date(exp.created_at).toISOString().substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const memberTotals = expenses?.reduce((acc, exp) => {
    acc[exp.paid_by] = (acc[exp.paid_by] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalAmount,
    expenseCount: expenses?.length || 0,
    categoryBreakdown: Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    })),
    monthlyBreakdown: Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => a.month.localeCompare(b.month)),
    memberBreakdown: Object.entries(memberTotals).map(([userId, amount]) => ({
      userId,
      amount
    }))
  };
};
