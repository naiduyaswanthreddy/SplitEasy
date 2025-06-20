
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'owed' | 'owe';
  otherUser: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  type: 'owed' | 'owe';
  totalAmount: number;
}

export const TransactionModal = ({ isOpen, onClose, transactions, type, totalAmount }: TransactionModalProps) => {
  const formatCurrency = (amount: number) => `₹${Math.abs(amount).toLocaleString()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>
              {type === 'owed' ? 'Money You Are Owed' : 'Money You Owe'}
            </span>
            <Badge variant={type === 'owed' ? 'default' : 'destructive'}>
              {formatCurrency(totalAmount)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                No transactions found
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {transaction.otherUser.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {type === 'owed' ? `${transaction.otherUser} owes you` : `You owe ${transaction.otherUser}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={type === 'owed' ? 'default' : 'destructive'}
                  className={type === 'owed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }
                >
                  {formatCurrency(transaction.amount)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
