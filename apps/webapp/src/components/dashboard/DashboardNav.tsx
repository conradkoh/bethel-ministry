'use client';

import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { Calendar, ChevronRight, Home, Menu, Settings, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const authState = useAuthState();
  const isAuthenticated = authState?.state === 'authenticated';

  // Close mobile menu on path change
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want the menu to close when the path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

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
      {/* Mobile Navigation Toggle Button - only show when authenticated */}
      {isAuthenticated && (
        <div className="fixed bottom-6 left-6 z-40 block lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full shadow-md ${isMobileMenuOpen ? 'hidden' : 'flex'}`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mobile Navigation Menu and Backdrop */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
              }
            }}
          />

          {/* Menu */}
          <div className="fixed inset-y-0 left-0 z-50 flex flex-col w-3/4 max-w-xs bg-background lg:hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="text-base font-medium">Navigation</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="py-3 px-3">
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
        </>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden h-full w-64 flex-col border-r bg-background px-3 py-4 lg:flex">
        <div className="space-y-1 mt-6">
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
        'flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-colors mb-1',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {item.icon}
      <span className="ml-2.5">{item.title}</span>
      {item.isExternal && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
    </Link>
  );
}
