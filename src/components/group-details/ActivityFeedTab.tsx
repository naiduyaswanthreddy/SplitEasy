
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  UserPlus, 
  Check, 
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';
import { getGroupExpenses, getGroupMembers } from '@/services/database';

interface ActivityFeedTabProps {
  groupId: string;
}

export const ActivityFeedTab = ({ groupId }: ActivityFeedTabProps) => {
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['group-expenses', groupId],
    queryFn: () => getGroupExpenses(groupId)
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId)
  });

  if (expensesLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform expenses into activity items
  const activities = expenses?.map(expense => ({
    id: expense.id,
    type: 'expense_added',
    user: expense.paid_by_profile?.name || 'Unknown',
    description: `added expense "${expense.description}"`,
    amount: expense.amount,
    timestamp: new Date(expense.created_at).toLocaleDateString(),
    icon: Plus
  })) || [];

  // Add member join activities (simplified - just showing current members)
  const memberActivities = members?.slice(0, 2).map((member, index) => ({
    id: `member-${member.id}`,
    type: 'member_joined',
    user: member.name,
    description: 'joined the group',
    timestamp: `${index + 1} day${index === 0 ? '' : 's'} ago`,
    icon: UserPlus
  })) || [];

  const allActivities = [...activities, ...memberActivities]
    .sort((a, b) => {
      // For proper sorting, we need to handle different timestamp formats
      const aTime = a.timestamp.includes('day') ? new Date(Date.now() - (parseInt(a.timestamp) * 24 * 60 * 60 * 1000)) : new Date(a.timestamp);
      const bTime = b.timestamp.includes('day') ? new Date(Date.now() - (parseInt(b.timestamp) * 24 * 60 * 60 * 1000)) : new Date(b.timestamp);
      return bTime.getTime() - aTime.getTime();
    })
    .slice(0, 10);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense_added':
        return Plus;
      case 'settlement':
        return Check;
      case 'member_joined':
        return UserPlus;
      default:
        return DollarSign;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'expense_added':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'settlement':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'member_joined':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Recent Activity
        </h2>
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          {allActivities.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-slate-600 dark:text-slate-400">
                No activity yet. Add an expense to get started!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {allActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                
                return (
                  <div key={activity.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {activity.user.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {activity.user}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {activity.description}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {'amount' in activity && activity.amount && (
                              <Badge variant="outline" className="text-xs">
                                ₹{activity.amount.toLocaleString()}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Expenses Added</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {expenses?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Settlements</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Members</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {members?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
