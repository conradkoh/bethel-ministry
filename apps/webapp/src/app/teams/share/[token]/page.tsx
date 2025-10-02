'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { useValidateShareLink } from '../../../../hooks/useShareLinks';
import { type TeamPermissionType, getPermissionLabel } from '../../../../lib/types/shareLink';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowRight, CheckCircle2, Link } from 'lucide-react';

interface ShareLinkPageProps {
  params: {
    token: string;
  };
}

export default function ShareLinkPage({ params }: ShareLinkPageProps) {
  const token = params.token;
  const router = useRouter();
  const { validationResult, isLoading } = useValidateShareLink(token);
  const { isAuthenticated } = useSession();
  const [accessGranted, setAccessGranted] = useState(false);

  // When validation result is available, store the token in session storage
  useEffect(() => {
    if (validationResult?.valid) {
      // Store the token and team info in session storage
      sessionStorage.setItem('shareToken', token);
      sessionStorage.setItem('shareTeamId', String(validationResult.teamId));
      sessionStorage.setItem('sharePermissions', JSON.stringify(validationResult.permissions));
      setAccessGranted(true);
    }
  }, [validationResult, token]);

  const handleContinue = () => {
    if (validationResult?.valid) {
      router.push(`/app/teams/${validationResult.teamId}`);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!validationResult?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Invalid Share Link
            </CardTitle>
            <CardDescription>
              This share link is invalid or has expired. Please contact the team owner for a new
              link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {validationResult?.message || 'The link you followed is not valid.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Team Access Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to access the team "{validationResult.teamName}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Permissions Granted:</h3>
            <div className="flex flex-wrap gap-2">
              {validationResult.permissions?.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {getPermissionLabel(permission as TeamPermissionType)}
                </Badge>
              ))}
            </div>
          </div>

          {accessGranted && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Access granted successfully!
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {isAuthenticated ? (
            <Button className="w-full" onClick={handleContinue}>
              Continue to Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                Log In
              </Button>
              <Button className="w-full" onClick={() => router.push('/login')}>
                Create Account
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
