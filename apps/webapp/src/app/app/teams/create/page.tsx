'use client';

import { CreateTeamModal } from '@/components/teams/modals/CreateTeamModal';
import { Button } from '@/components/ui/button';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [parentId, setParentId] = useState<Id<'teams'> | null>(null);

  // Get parent ID from URL params if available
  useEffect(() => {
    const parentIdParam = searchParams.get('parentId');
    if (parentIdParam) {
      setParentId(parentIdParam as Id<'teams'>);
    }
  }, [searchParams]);

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Navigate back
    router.back();
  };

  // Handle successful team creation
  const handleSuccess = (newTeamId: Id<'teams'>) => {
    setIsModalOpen(false);
    // Navigate to the new team's detail page
    router.push(`/app/teams/${newTeamId}`);
  };

  return (
    <div className="container p-6">
      <div className="mb-6">
        <Link href="/app/teams">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
      </div>

      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Create New Team</h1>
        <p className="text-gray-500 mb-6">
          {parentId ? 'Creating a child team' : 'Creating a new root team'}
        </p>
        <Button onClick={() => setIsModalOpen(true)}>Open Creation Form</Button>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        parentId={parentId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
