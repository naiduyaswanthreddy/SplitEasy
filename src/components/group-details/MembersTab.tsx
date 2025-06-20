
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, Mail, Phone } from 'lucide-react';
import { Group, getGroupMembers, getGroupBalances } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';
import { AddMemberModal } from './AddMemberModal';

interface MembersTabProps {
  groupId: string;
  group: Group;
}

export const MembersTab = ({ groupId, group }: MembersTabProps) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId)
  });

  const { data: balances } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => getGroupBalances(groupId)
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Members ({members?.length || 0})
        </h2>
        <Button 
          onClick={() => setIsAddMemberOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4">
        {members?.map((member) => {
          const userInitials = member.name 
            ? member.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : member.email.substring(0, 2).toUpperCase();

          // Find member balance
          const memberBalance = balances?.find(b => b.user_id === member.id);
          const balance = memberBalance?.net_balance || 0;

          return (
            <Card key={member.id} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url} alt={member.name} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {member.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {member.id === group.created_by && (
                      <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Creator
                      </Badge>
                    )}
                    
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Balance</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ₹{Math.abs(balance).toLocaleString()}
                        </p>
                        {balance !== 0 && (
                          <Badge 
                            variant={balance > 0 ? 'default' : 'destructive'}
                            className={balance > 0 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }
                          >
                            {balance > 0 ? 'Owed' : 'Owes'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Member Card */}
      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Invite More Friends
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Add more people to your group to split expenses together.
          </p>
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </CardContent>
      </Card>

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={groupId}
      />
    </div>
  );
};
