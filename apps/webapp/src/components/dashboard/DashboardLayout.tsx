'use client';

import type { ReactNode } from 'react';
import { DashboardNav } from './DashboardNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <div className="flex-1 w-full">
        <main>{children}</main>
      </div>
    </div>
  );
}
