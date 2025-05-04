'use client';

import { cn } from '@/lib/utils';
import { CalendarRange, Landmark, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface TeamLayoutProps {
  children: React.ReactNode;
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;

  const navItems = [
    {
      name: 'Overview',
      href: `/app/teams/${teamId}`,
      icon: <Landmark className="h-4 w-4 mr-2" />,
    },
    {
      name: 'Participants',
      href: `/app/teams/${teamId}/participants`,
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      name: 'Attendance',
      href: `/app/teams/${teamId}/attendance`,
      icon: <CalendarRange className="h-4 w-4 mr-2" />,
    },
    {
      name: 'Settings',
      href: `/app/teams/${teamId}/settings`,
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-14 items-center px-4 max-w-full mx-auto overflow-x-auto">
          <nav className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
