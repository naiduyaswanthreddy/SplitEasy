
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserBalances } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionModal } from './TransactionModal';

export const BalanceSummary = () => {
  const [owedModalOpen, setOwedModalOpen] = useState(false);
  const [oweModalOpen, setOweModalOpen] = useState(false);

  const { data: balances, isLoading, error } = useQuery({
    queryKey: ['user-balances'],
    queryFn: getUserBalances,
    refetchInterval: 30000
  });

  // Mock transactions data - in a real app, this would come from an API
  const mockOwedTransactions = [
    {
      id: '1',
      description: 'Dinner at Pizza Place',
      amount: 250,
      date: '2024-01-15',
      type: 'owed' as const,
      otherUser: 'John Doe'
    },
    {
      id: '2',
      description: 'Movie tickets',
      amount: 180,
      date: '2024-01-12',
      type: 'owed' as const,
      otherUser: 'Jane Smith'
    }
  ];

  const mockOweTransactions = [
    {
      id: '3',
      description: 'Groceries',
      amount: 320,
      date: '2024-01-14',
      type: 'owe' as const,
      otherUser: 'Mike Johnson'
    }
  ];

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span>Balance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Balance Summary Error:', error);
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span>Balance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Unable to load balance data
            </p>
            <p className="text-xs text-red-600">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalOwed = 0, totalOwing = 0 } = balances || {};
  const netBalance = totalOwing - totalOwed;

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span>Balance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            onClick={() => setOwedModalOpen(true)}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200 block">
                  You're owed
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-300">
                  Click to see transactions
                </span>
              </div>
            </div>
            <span className="text-lg font-bold text-emerald-600">
              ₹{totalOwing.toLocaleString()}
            </span>
          </div>

          <div 
            className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
            onClick={() => setOweModalOpen(true)}
          >
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <div>
                <span className="text-sm font-medium text-rose-800 dark:text-rose-200 block">
                  You owe
                </span>
                <span className="text-xs text-rose-600 dark:text-rose-300">
                  Click to see transactions
                </span>
              </div>
            </div>
            <span className="text-lg font-bold text-rose-600">
              ₹{totalOwed.toLocaleString()}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Net Balance
              </span>
              <span className={`text-lg font-bold ${
                netBalance > 0 
                  ? 'text-emerald-600' 
                  : netBalance < 0 
                    ? 'text-rose-600' 
                    : 'text-slate-600 dark:text-slate-400'
              }`}>
                {netBalance > 0 ? '+' : ''}₹{netBalance.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {netBalance > 0 
                ? 'Overall, you are owed money'
                : netBalance < 0 
                  ? 'Overall, you owe money'
                  : 'You are settled up!'
              }
            </p>
          </div>

          {netBalance !== 0 && (
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              Settle All Balances
            </Button>
          )}
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={owedModalOpen}
        onClose={() => setOwedModalOpen(false)}
        transactions={mockOwedTransactions}
        type="owed"
        totalAmount={totalOwing}
      />

      <TransactionModal
        isOpen={oweModalOpen}
        onClose={() => setOweModalOpen(false)}
        transactions={mockOweTransactions}
        type="owe"
        totalAmount={totalOwed}
      />
    </>
  );
};
