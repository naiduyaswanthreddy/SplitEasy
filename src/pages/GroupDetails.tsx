
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { GroupOverview } from '@/components/group-details/GroupOverview';
import { ExpensesTab } from '@/components/group-details/ExpensesTab';
import { MembersTab } from '@/components/group-details/MembersTab';
import { BalancesTab } from '@/components/group-details/BalancesTab';
import { AnalyticsTab } from '@/components/group-details/AnalyticsTab';
import { ActivityFeedTab } from '@/components/group-details/ActivityFeedTab';
import { GroupSettingsModal } from '@/components/group-details/GroupSettingsModal';
import { getGroupDetails } from '@/services/database';
import { Skeleton } from '@/components/ui/skeleton';

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group-details', groupId],
    queryFn: () => getGroupDetails(groupId!),
    enabled: !!groupId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Group Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The group you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 dark:text-slate-400 self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
            <div className="flex items-center space-x-3">
              <div className="text-3xl sm:text-4xl">{group.avatar}</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full sm:w-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            Group Settings
          </Button>
        </div>

        {/* Group Overview Panel */}
        <div className="mb-6 sm:mb-8">
          <GroupOverview group={group} />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="expenses" className="text-xs sm:text-sm px-2 py-2">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm px-2 py-2">
              Members
            </TabsTrigger>
            <TabsTrigger value="balances" className="text-xs sm:text-sm px-2 py-2">
              Balances
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm px-2 py-2">
              Activity
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs sm:text-sm px-2 py-2">
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab groupId={groupId!} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MembersTab groupId={groupId!} group={group} />
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <BalancesTab groupId={groupId!} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab groupId={groupId!} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityFeedTab groupId={groupId!} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                AI Assistant Coming Soon
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Ask natural language questions about your group expenses
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <GroupSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          group={group}
        />
      </main>
    </div>
  );
};

export default GroupDetails;
