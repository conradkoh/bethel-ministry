'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ArrowLeft, Link2, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;

  // Define the settings tabs
  const tabs = [
    {
      value: 'general',
      label: 'General',
      href: `/app/teams/${teamId}/settings`,
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    {
      value: 'share',
      label: 'Share Links',
      href: `/app/teams/${teamId}/settings/share`,
      icon: <Link2 className="h-4 w-4 mr-2" />,
    },
  ];

  // Determine the active tab based on the current pathname
  const activeTab = pathname.includes('/share') ? 'share' : 'general';

  return (
    <div className="container p-6 space-y-6">
      <div className="mb-6">
        <Link href={`/app/teams/${teamId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground mt-2">Manage team settings and access controls</p>
      </div>

      <Tabs value={activeTab} className="space-y-6">
        <TabsList className="mb-4">
          {tabs.map((tab) => (
            <Link key={tab.value} href={tab.href} className="w-full sm:w-auto">
              <TabsTrigger
                value={tab.value}
                className={cn('w-full sm:w-auto', activeTab === tab.value ? 'bg-background' : '')}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
}
