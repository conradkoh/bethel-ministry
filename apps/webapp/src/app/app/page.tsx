'use client';

import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { Calendar, Settings, Star, Users } from 'lucide-react';
import Link from 'next/link';

export default function AppPage() {
  const authState = useAuthState();

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <Link href="/app/profile">
          <Button variant="outline" size="sm">
            View Profile
          </Button>
        </Link>
      </div>

      {authState?.state === 'authenticated' && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Welcome, {authState.user.name || 'User'}</h2>
            <p className="text-gray-700">
              This is your main app dashboard. From here, you can explore the application features.
            </p>

            {authState.user.type === 'anonymous' && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Tip:</span> You're using an anonymous account.
                  Visit your{' '}
                  <Link href="/app/profile" className="text-blue-600 underline hover:text-blue-800">
                    profile page
                  </Link>{' '}
                  to personalize your display name.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Teams"
              value="0"
              icon={<Users className="h-5 w-5" />}
              description="Manage your ministry teams"
              linkHref="/app/teams"
              linkText="View Teams"
            />

            <DashboardCard
              title="Attendance"
              value="0"
              icon={<Calendar className="h-5 w-5" />}
              description="Track attendance records"
              linkHref="/app/attendance"
              linkText="View Attendance"
              variant="success"
            />

            <DashboardCard
              title="Reporting"
              value="0"
              icon={<Star className="h-5 w-5" />}
              description="View ministry reports"
              linkHref="/app/reports"
              linkText="View Reports"
            />

            <DashboardCard
              title="Settings"
              value="Account"
              icon={<Settings className="h-5 w-5" />}
              description="Manage your account settings"
              linkHref="/app/settings"
              linkText="Go to Settings"
            />
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Your recent activity will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
