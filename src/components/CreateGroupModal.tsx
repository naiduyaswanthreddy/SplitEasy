
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '@/services/database';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const groupEmojis = ['🏖️', '🍕', '🎬', '✈️', '🏠', '🚗', '🎉', '🏔️', '🌴', '🍻'];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏖️');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: ({ name, description, avatar, memberEmails }: {
      name: string;
      description: string;
      avatar: string;
      memberEmails: string[];
    }) => createGroup(name, description, avatar, memberEmails),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Group "${groupName}" created successfully`,
      });
      
      // Invalidate and refetch groups
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedEmoji('🏖️');
      setMembers([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    }
  });

  const handleAddMember = () => {
    if (memberEmail && memberEmail.includes('@') && !members.includes(memberEmail)) {
      setMembers([...members, memberEmail]);
      setMemberEmail('');
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m !== email));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      name: groupName,
      description: groupDescription,
      avatar: selectedEmoji,
      memberEmails: members
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span>Create New Group</span>
          </DialogTitle>
          <DialogDescription>
            Create a new group to start tracking shared expenses
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Group Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Goa Trip 2024"
              className="col-span-3"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Group Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Optional description"
              className="col-span-3"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
          </div>

          {/* Emoji Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Icon</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {groupEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                    selectedEmoji === emoji
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Add Members */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="members" className="text-right mt-2">
              Members
            </Label>
            <div className="col-span-3 space-y-3">
              <div className="flex space-x-2">
                <Input
                  id="members"
                  placeholder="Enter email address"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMember}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Members List */}
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <Badge
                      key={member}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{member}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup} 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            disabled={createGroupMutation.isPending}
          >
            {createGroupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
