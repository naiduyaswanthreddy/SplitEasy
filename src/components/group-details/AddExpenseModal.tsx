
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createExpense, getGroupMembers } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Receipt } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const AddExpenseModal = ({ isOpen, onClose, groupId }: AddExpenseModalProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [paidBy, setPaidBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch group members to populate the "paid by" dropdown
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: isOpen
  });

  // Set current user as default payer when modal opens
  React.useEffect(() => {
    if (isOpen && user && !paidBy) {
      setPaidBy(user.id);
    }
  }, [isOpen, user, paidBy]);

  const categories = [
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'general', label: 'General', icon: '📝' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description.",
        variant: "destructive"
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    if (!paidBy) {
      toast({
        title: "Error",
        description: "Please select who paid for this expense.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await createExpense(
        groupId,
        description.trim(),
        Number(amount),
        category,
        'equal', // Default to equal split
        paidBy
      );

      toast({
        title: "Success",
        description: "Expense added successfully!"
      });

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['group-expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-details', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });

      // Reset form and close
      setDescription('');
      setAmount('');
      setCategory('general');
      setPaidBy(user?.id || '');
      onClose();

    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add expense",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Add New Expense</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center space-x-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paidBy">Paid By *</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue placeholder={membersLoading ? "Loading members..." : "Select who paid"} />
              </SelectTrigger>
              <SelectContent>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      <span>{member.name}</span>
                      {member.id === user?.id && <span className="text-xs text-slate-500">(You)</span>}
                    </div>
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
            {membersLoading && (
              <p className="text-xs text-slate-500 mt-1">Loading group members...</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || membersLoading}>
              {isLoading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
