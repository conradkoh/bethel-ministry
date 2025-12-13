// @ts-nocheck - Complex form types
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateTeam, useUpdateTeam } from '../../hooks/useTeams';
import { TIMEZONE_OPTIONS, type TeamFormData } from '../../lib/types/team';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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

interface TeamFormProps {
  parentId?: Id<'teams'> | null;
  initialData?: Partial<TeamFormData>;
  teamId?: Id<'teams'>;
  onSuccess?: (teamId: Id<'teams'>) => void;
  onCancel?: () => void;
}

export function TeamForm({ parentId, initialData, teamId, onSuccess, onCancel }: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get create and update hooks
  const { createTeam } = useCreateTeam();
  const { updateTeam } = useUpdateTeam();

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      timezone: initialData?.timezone || 'Asia/Singapore',
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        timezone: initialData.timezone || 'Asia/Singapore',
      });
    }
  }, [form, initialData]);

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if we're creating or updating
      if (teamId) {
        // Update existing team
        const result = await updateTeam(teamId, {
          name: values.name,
          timezone: values.timezone,
        });

        if (result.success) {
          onSuccess?.(teamId);
        } else {
          setError(result.error || 'Failed to update team');
        }
      } else {
        // Create new team
        const result = await createTeam(values.name, values.timezone, parentId || undefined);

        if (result.success && result.teamId) {
          onSuccess?.(result.teamId);
        } else {
          setError(result.error || 'Failed to create team');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
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
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="text-sm font-medium text-destructive">{error}</div>}

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : teamId ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
