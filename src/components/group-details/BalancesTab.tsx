
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Check, Share } from 'lucide-react';
import { getGroupBalances, getGroupMembers } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface BalancesTabProps {
  groupId: string;
}

export const BalancesTab = ({ groupId }: BalancesTabProps) => {
  const { user } = useAuth();

  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => getGroupBalances(groupId)
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId)
  });

  const formatCurrency = (amount: number) => `₹${Math.abs(amount).toLocaleString()}`;

  if (balancesLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Calculate current user's totals
  const currentUserBalance = balances?.find(b => b.user_id === user?.id);
  const currentUserOwed = currentUserBalance && currentUserBalance.net_balance > 0 ? currentUserBalance.net_balance : 0;
  const currentUserOwes = currentUserBalance && currentUserBalance.net_balance < 0 ? Math.abs(currentUserBalance.net_balance) : 0;

  // Get balances with member info
  const balancesWithMembers = balances?.map(balance => {
    const member = members?.find(m => m.id === balance.user_id);
    return {
      ...balance,
      member
    };
  }).filter(b => b.member && b.net_balance !== 0) || [];

  // Separate into who owes current user and who current user owes
  const currentUserIsOwed = balancesWithMembers.filter(b => 
    b.user_id !== user?.id && b.net_balance < 0
  );
  
  const currentUserOwesOthers = balancesWithMembers.filter(b => 
    b.user_id !== user?.id && b.net_balance > 0
  );

  // Generate settlement suggestions (simplified)
  const settlements = [];
  
  // Users who owe money (negative balance)
  const debtors = balancesWithMembers.filter(b => b.net_balance < 0);
  // Users who are owed money (positive balance)  
  const creditors = balancesWithMembers.filter(b => b.net_balance > 0);

  // Simple settlement algorithm - match debtors with creditors
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (Math.abs(debtor.net_balance) > 0 && creditor.net_balance > 0) {
        const settlementAmount = Math.min(Math.abs(debtor.net_balance), creditor.net_balance);
        if (settlementAmount > 0) {
          settlements.push({
            from: debtor.member?.name || 'Unknown',
            to: creditor.member?.name || 'Unknown',
            amount: settlementAmount
          });
          // Update running balances for algorithm
          debtor.net_balance += settlementAmount;
          creditor.net_balance -= settlementAmount;
        }
      }
    }
  }

  const copySettlementPlan = () => {
    const planText = settlements.map(s => 
      `${s.from} pays ₹${s.amount.toLocaleString()} to ${s.to}`
    ).join('\n');
    
    navigator.clipboard.writeText(planText);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Balance Summary
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600 dark:text-green-400">
              You Are Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(currentUserOwed)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              From {currentUserIsOwed.length} {currentUserIsOwed.length === 1 ? 'person' : 'people'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600 dark:text-red-400">
              You Owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(currentUserOwes)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              To {currentUserOwesOthers.length} {currentUserOwesOthers.length === 1 ? 'person' : 'people'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Balances */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Individual Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {balancesWithMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                No outstanding balances. All settled up! 🎉
              </p>
            </div>
          ) : (
            balancesWithMembers.map((balance) => {
              if (!balance.member || balance.user_id === user?.id) return null;
              
              const userInitials = balance.member.name 
                ? balance.member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : balance.member.email.substring(0, 2).toUpperCase();

              const isOwed = balance.net_balance < 0; // They owe current user
              const amount = Math.abs(balance.net_balance);

              return (
                <div key={balance.user_id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {balance.member.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isOwed ? 'Owes you' : 'You owe'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={isOwed ? 'default' : 'destructive'}
                      className={isOwed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }
                    >
                      {formatCurrency(amount)}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Check className="h-4 w-4 mr-1" />
                      Settle
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Settlement Suggestions */}
      {settlements.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Suggested Settlements</CardTitle>
            <Button variant="outline" size="sm" onClick={copySettlementPlan}>
              <Share className="h-4 w-4 mr-2" />
              Copy Plan
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Minimum transactions to settle all balances:
            </p>
            
            {settlements.map((settlement, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {settlement.from.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {settlement.to.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {settlement.from} pays {settlement.to}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="font-semibold">
                  ₹{settlement.amount.toLocaleString()}
                </Badge>
              </div>
            ))}
            
            <Button className="w-full mt-4" onClick={copySettlementPlan}>
              Copy Settlement Plan to WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
