'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateParticipant, useUpdateParticipant } from '../../hooks/useParticipants';
import type { ParticipantFormData } from '../../lib/types/participant';

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

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Participant name must be at least 2 characters.',
  }),
  joinDate: z.coerce.number().min(0, {
    message: 'Please select a valid join date.',
  }),
});

interface ParticipantFormProps {
  teamId: Id<'teams'>;
  initialData?: Partial<ParticipantFormData>;
  participantId?: Id<'participants'>;
  onSuccess?: (participantId: Id<'participants'>) => void;
  onCancel?: () => void;
}

export function ParticipantForm({
  teamId,
  initialData,
  participantId,
  onSuccess,
  onCancel,
}: ParticipantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get create and update hooks
  const { createParticipant } = useCreateParticipant();
  const { updateParticipant } = useUpdateParticipant();

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      joinDate: initialData?.joinDate || Date.now(),
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        joinDate: initialData.joinDate || Date.now(),
      });
    }
  }, [form, initialData]);

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if we're creating or updating
      if (participantId) {
        // Update existing participant
        const result = await updateParticipant(participantId, {
          name: values.name,
          joinDate: values.joinDate,
        });

        if (result.success) {
          onSuccess?.(participantId);
        } else {
          setError(result.error || 'Failed to update participant');
        }
      } else {
        // Create new participant
        const result = await createParticipant({
          name: values.name,
          joinDate: values.joinDate,
          teamId,
        });

        if (result.success && result.participantId) {
          onSuccess?.(result.participantId);
        } else {
          setError(result.error || 'Failed to create participant');
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter participant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Join Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={new Date(field.value).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    field.onChange(date.getTime());
                  }}
                />
              </FormControl>
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
            {isSubmitting ? 'Saving...' : participantId ? 'Update Participant' : 'Add Participant'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
