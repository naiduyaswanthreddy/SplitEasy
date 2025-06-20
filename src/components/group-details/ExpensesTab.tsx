
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getGroupExpenses, getExpenseSplits, deleteExpense } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';
import { AddExpenseModal } from '@/components/group-details/AddExpenseModal';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ExpensesTabProps {
  groupId: string;
}

export const ExpensesTab = ({ groupId }: ExpensesTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['group-expenses', groupId],
    queryFn: () => getGroupExpenses(groupId)
  });

  const { data: expenseSplits } = useQuery({
    queryKey: ['expense-splits', expandedExpense],
    queryFn: () => expandedExpense ? getExpenseSplits(expandedExpense) : Promise.resolve([]),
    enabled: !!expandedExpense
  });

  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = ['food', 'travel', 'shopping', 'entertainment', 'utilities', 'general'];

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpense(expenseId);
      toast({
        title: "Success",
        description: "Expense deleted successfully!"
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['group-expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-details', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      
      if (expandedExpense === expenseId) {
        setExpandedExpense(null);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Expenses ({filteredExpenses.length})
        </h2>
        <Button 
          onClick={() => setIsAddExpenseOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No expenses yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Start tracking expenses by adding your first one.
              </p>
              <Button onClick={() => setIsAddExpenseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-2xl">
                      {expense.category === 'food' && '🍽️'}
                      {expense.category === 'travel' && '✈️'}
                      {expense.category === 'shopping' && '🛍️'}
                      {expense.category === 'entertainment' && '🎬'}
                      {expense.category === 'utilities' && '⚡'}
                      {expense.category === 'general' && '📝'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {expense.description}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {expense.split_type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Paid by {expense.paid_by_profile?.name || 'Unknown'}
                        </p>
                        <span className="text-slate-400">•</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        ₹{expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedExpense(
                          expandedExpense === expense.id ? null : expense.id
                        )}
                      >
                        {expandedExpense === expense.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {expandedExpense === expense.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Split Details
                    </h4>
                    <div className="space-y-2">
                      {expenseSplits && expenseSplits.length > 0 ? (
                        expenseSplits.map((split) => (
                          <div key={split.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {split.user_profile?.name || 'Unknown User'}
                            </span>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              ₹{split.amount.toLocaleString()}
                              {split.percentage && ` (${split.percentage}%)`}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Loading split details...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={groupId}
      />
    </div>
  );
};
