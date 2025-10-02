'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  linkHref?: string;
  linkText?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  description,
  linkHref,
  linkText = 'View Details',
  variant = 'default',
  className,
}: DashboardCardProps) {
  // Define variant styles
  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-500 bg-green-50 dark:bg-green-950/20',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    danger: 'border-red-500 bg-red-50 dark:bg-red-950/20',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', variantStyles[variant], className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {linkHref && (
          <div className="mt-4">
            <Link href={linkHref}>
              <Button variant="link" className="h-auto p-0 font-medium text-primary">
                {linkText}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
