'use client';

import { withDashboardLayout } from '@/components/dashboard/withDashboardLayout';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

function AttendancePage() {
  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Attendance
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Attendance Tracking</h2>
            <p className="text-gray-500 max-w-md mb-6">
              Track attendance for your ministry teams and events. This feature is coming soon.
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withDashboardLayout(AttendancePage);
