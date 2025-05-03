'use client';

import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Home, Menu, Settings, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

export function DashboardNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to check if the current path matches a route pattern
  const isRouteActive = (href: string) => {
    if (href === '/app' && pathname === '/app') {
      return true;
    }
    if (href === '/app/teams' && pathname.startsWith('/app/teams')) {
      return true;
    }
    if (href === '/app/attendance' && pathname.startsWith('/app/attendance')) {
      return true;
    }
    if (href === '/app/settings' && pathname.startsWith('/app/settings')) {
      return true;
    }
    return false;
  };

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/app',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Teams',
      href: '/app/teams',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Attendance',
      href: '/app/attendance',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/app/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="flex items-center lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background pt-16 lg:hidden">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  item={item}
                  isActive={isRouteActive(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden h-full w-64 flex-col border-r bg-background px-3 py-4 lg:flex">
        <div className="mb-10 px-4 text-xl font-bold">Bethel Ministry</div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <DesktopNavLink key={item.href} item={item} isActive={isRouteActive(item.href)} />
          ))}
        </div>
      </nav>
    </>
  );
}

function DesktopNavLink({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {item.icon}
      <span className="ml-3">{item.title}</span>
      {item.isExternal && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
    </Link>
  );
}

function MobileNavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={item.href}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center rounded-md px-3 py-4 text-lg font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {item.icon}
      <span className="ml-3">{item.title}</span>
      {item.isExternal && <ChevronRight className="ml-auto h-5 w-5 opacity-70" />}
    </Link>
  );
}
