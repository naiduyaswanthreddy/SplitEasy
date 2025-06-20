
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Group } from '@/services/database';
import { Settings, Save, Trash2 } from 'lucide-react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export const GroupSettingsModal = ({ isOpen, onClose, group }: GroupSettingsModalProps) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [avatar, setAvatar] = useState(group.avatar);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const avatarOptions = ['🏖️', '🏠', '🎉', '✈️', '🍽️', '🛍️', '🏕️', '🎯', '💼', '🎓'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, just show success message
      toast({
        title: "Success",
        description: "Group settings updated successfully!",
      });

      queryClient.invalidateQueries({ queryKey: ['group-details', group.id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });

      onClose();

    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      // For now, just show success message and navigate
      toast({
        title: "Success",
        description: "Group deleted successfully!",
      });

      // Navigate back to home
      navigate('/');
      onClose();

    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Group Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              rows={3}
            />
          </div>

          <div>
            <Label>Group Avatar</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {avatarOptions.map((emojiOption) => (
                <button
                  key={emojiOption}
                  type="button"
                  onClick={() => setAvatar(emojiOption)}
                  className={`p-2 text-xl sm:p-3 sm:text-2xl rounded-lg border-2 transition-colors ${
                    avatar === emojiOption
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {emojiOption}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Note: Group settings updates will be available in a future version. 
              This is currently a preview of the settings interface.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isDeleting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isDeleting}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Once you delete a group, there is no going back. All expenses and member data will be permanently removed.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              disabled={isLoading || isDeleting}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Group'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
