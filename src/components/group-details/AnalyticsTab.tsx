
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { getGroupAnalytics, getGroupMembers } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface AnalyticsTabProps {
  groupId: string;
}

export const AnalyticsTab = ({ groupId }: AnalyticsTabProps) => {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['group-analytics', groupId],
    queryFn: () => getGroupAnalytics(groupId)
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId)
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  if (analyticsLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No analytics data available
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Add some expenses to see analytics
        </p>
      </div>
    );
  }

  // Prepare member breakdown data with names
  const memberBreakdownWithNames = analytics.memberBreakdown.map(member => {
    const memberInfo = members?.find(m => m.id === member.userId);
    return {
      ...member,
      name: memberInfo?.name || 'Unknown User'
    };
  });

  // Prepare category data for pie chart
  const categoryData = analytics.categoryBreakdown.map((cat, index) => ({
    name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    value: cat.amount,
    fill: COLORS[index % COLORS.length]
  }));

  // Prepare monthly data for line chart
  const monthlyData = analytics.monthlyBreakdown.map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    amount: month.amount
  }));

  const averageExpense = analytics.expenseCount > 0 ? analytics.totalAmount / analytics.expenseCount : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Group Analytics
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(analytics.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.expenseCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Average Expense</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(averageExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Top Category</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {analytics.categoryBreakdown[0]?.category.charAt(0).toUpperCase() + 
                   analytics.categoryBreakdown[0]?.category.slice(1) || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Contributions */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Member Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {memberBreakdownWithNames.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={memberBreakdownWithNames}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No member data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spending Trend */}
      {monthlyData.length > 1 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
