// @ts-nocheck - Complex form type issues with zodResolver and react-hook-form
'use client';

import { useDeleteTeam, useTeam, useUpdateTeam } from '@/hooks/useTeams';
import { TIMEZONE_OPTIONS } from '@/lib/types/team';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Team name must be at least 2 characters.',
  }),
  timezone: z.string().min(1, {
    message: 'Please select a timezone.',
  }),
});

export default function TeamSettingsPage() {
  const params = useParams();
  const teamId = params.teamId as unknown as Id<'teams'>;
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get team data
  const { team, isLoading, error } = useTeam(teamId);
  const { updateTeam } = useUpdateTeam();
  const { deleteTeam } = useDeleteTeam();

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-expect-error - Complex generic type issue with zodResolver
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      timezone: '',
    },
  });

  // Update form values when team data is loaded
  useEffect(() => {
    if (team) {
      form.setValue('name', team.name);
      form.setValue('timezone', team.timezone);
    }
  }, [team, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    try {
      const result = await updateTeam(teamId, {
        name: data.name,
        timezone: data.timezone,
      });

      if (result.success) {
        toast.success('Team settings have been successfully updated.');
      } else {
        toast.error(result.error || 'Failed to update team settings.');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle team deletion
  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTeam(teamId);

      if (result.success) {
        toast.success('Team has been successfully deleted.');
        router.push('/app/teams');
      } else {
        toast.error(result.error || 'Failed to delete team.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p>Loading team settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !team) {
    return (
      <div className="container p-6">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load team settings. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
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
        <p className="text-muted-foreground mt-2">Manage team name, timezone, and other settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your team's information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* @ts-ignore - Complex generic type issue with react-hook-form Control type */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed throughout the application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* @ts-ignore - Complex generic type issue with react-hook-form Control type */}
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        All date and time information will be displayed in this timezone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving changes...' : 'Save changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete this team and all of its data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. Deleting a team will also remove all participants and
              attendance records for this team.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Team</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the team "{team.name}
                    " and all of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTeam}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Team'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
