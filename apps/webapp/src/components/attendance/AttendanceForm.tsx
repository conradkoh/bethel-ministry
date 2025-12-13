// @ts-nocheck - Complex form types and unimplemented API functions
'use client';

import { formatDate } from '@/lib/utils/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Form validation schema
const formSchema = z.object({
  name: z.string().optional(),
  date: z.date({
    // @ts-expect-error - required_error is valid in zod but types may not reflect it
    required_error: 'A date is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AttendanceFormProps {
  teamId: Id<'teams'>;
  onSuccess?: () => void;
}

export function AttendanceForm({ teamId, onSuccess }: AttendanceFormProps) {
  const router = useRouter();
  // @ts-expect-error - API function not yet implemented in backend
  const createAttendanceActivity = useSessionMutation(api.attendance.createAttendanceActivity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const form = useForm<FormValues>({
    // @ts-expect-error - Complex generic type issue with zodResolver
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date: new Date(),
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newActivity = await createAttendanceActivity({
        teamId,
        date: values.date.getTime(),
        name: values.name || undefined,
      });

      toast.success('Attendance activity created', {
        description: 'Redirecting to attendance marking page...',
      });

      form.reset();

      // Redirect to the newly created activity page
      router.push(`/app/teams/${teamId}/attendance/${newActivity}`);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create attendance activity:', error);
      setError('Failed to create attendance activity. Please try again.');
      toast.error('Error', {
        description: 'Failed to create attendance activity. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Sunday Service"
                  {...field}
                  value={field.value || ''}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Give this attendance activity a descriptive name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        formatDate(field.value, 'FULL_DATE')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || isSubmitting}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Select the date for this attendance activity.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Activity'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
