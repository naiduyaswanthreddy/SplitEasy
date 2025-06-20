
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Coffee, Car, Home, ShoppingBag, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRecentExpenses } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons = {
  food: Coffee,
  transport: Car,
  accommodation: Home,
  shopping: ShoppingBag,
  general: DollarSign,
};

export const RecentActivity = () => {
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ['recent-expenses'],
    queryFn: () => getRecentExpenses(10)
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Failed to load recent activity</p>
        </CardContent>
      </Card>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-slate-600 dark:text-slate-400">
              No expenses yet. Add your first expense to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.map((expense) => {
          const IconComponent = categoryIcons[expense.category as keyof typeof categoryIcons] || DollarSign;
          const timeAgo = new Date(expense.created_at).toLocaleDateString();

          return (
            <div key={expense.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <IconComponent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {expense.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paid by {expense.paid_by_profile?.name || 'Unknown'}
                  </p>
                  <span className="text-xs text-slate-400">•</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {timeAgo}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  ₹{Number(expense.amount).toLocaleString()}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
