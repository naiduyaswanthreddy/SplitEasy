
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, User } from 'lucide-react';
import { Group } from '@/services/database';

interface GroupOverviewProps {
  group: Group;
}

export const GroupOverview = ({ group }: GroupOverviewProps) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {group.member_count || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="h-5 w-5 text-green-600 dark:text-green-400 font-bold">₹</div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(group.total_expenses || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <div className="h-5 w-5 text-purple-600 dark:text-purple-400 font-bold">₹</div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your Balance</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(Math.abs(group.your_balance || 0))}
                </p>
                {group.your_balance !== 0 && (
                  <Badge 
                    variant={group.your_balance! > 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {group.your_balance! > 0 ? 'Owed' : 'Owes'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {new Date(group.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center">
                <User className="h-3 w-3 mr-1" />
                By Creator
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
