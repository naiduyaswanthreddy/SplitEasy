import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getGroups } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export const GroupCard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups
  });

  const handleGroupClick = (groupId: string, groupName: string) => {
    console.log('Navigating to group:', groupId);
    navigate(`/group/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <p className="text-sm text-red-600">Failed to load groups</p>
        </CardContent>
      </Card>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No groups yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Create your first group to start tracking expenses with friends and family.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOwed = (group.your_balance || 0) > 0;
        const isOwing = (group.your_balance || 0) < 0;

        return (
          <Card 
            key={group.id} 
            className="hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer"
            onClick={() => handleGroupClick(group.id, group.name)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{group.avatar}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{group.member_count} members</span>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>{group.last_activity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total spent</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      ₹{(group.total_expenses || 0).toLocaleString()}
                    </p>
                  </div>

                  {group.your_balance !== 0 && (
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isOwed ? 'You get' : 'You owe'}
                      </p>
                      <Badge 
                        variant={isOwed ? 'default' : 'destructive'}
                        className={isOwed 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200' 
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900 dark:text-rose-200'
                        }
                      >
                        ₹{Math.abs(group.your_balance || 0).toLocaleString()}
                      </Badge>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handleGroupClick(group.id, group.name);
                  }}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
