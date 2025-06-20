
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BalanceSummary } from '@/components/BalanceSummary';
import { GroupCard } from '@/components/GroupCard';
import { RecentActivity } from '@/components/RecentActivity';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Balance Summary */}
          <div className="lg:col-span-1">
            <BalanceSummary />
          </div>

          {/* Middle Column - Groups */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Your Groups
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage expenses with friends and family
                </p>
              </div>
              <Button 
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            <GroupCard />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <RecentActivity />
        </div>
      </main>

      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </div>
  );
};

export default Index;
