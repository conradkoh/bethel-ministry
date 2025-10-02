'use client';

import { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Team } from '../../lib/types/team';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarPlus, Clock, Edit, Trash2, Users } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  // Format the date from a timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Navigate to team details page
  const handleClick = () => {
    router.push(`/app/teams/${team._id}`);
  };

  // Edit team button handler
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(team);
    }
  };

  // Delete team button handler
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(team);
    }
  };

  return (
    <Card
      className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md"
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{team.name}</span>
          {isHovering && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardTitle>
        <CardDescription className="flex items-center space-x-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 opacity-70" />
          <span>{team.timezone}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span className="font-medium">Created:</span>
            <span>{formatDate(team.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col space-y-2 w-full">
        <Button variant="outline" size="sm" className="w-full" onClick={handleClick}>
          View Team
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/app/teams/${team._id}/attendance/create`);
          }}
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </CardFooter>
    </Card>
  );
}
