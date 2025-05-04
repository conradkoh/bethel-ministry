# Attendance Route Structure Fix Plan

## Current Issue
The attendance feature routes are currently structured incorrectly:
- Team-specific routes are at `/app/[teamId]/*` instead of `/app/teams/[teamId]/*`
- This is inconsistent with the rest of the application which uses `/app/teams/[id]` for team details

## Current Routes vs. Correct Routes

| Current Route | Correct Route |
|--------------|---------------|
| `/app/[teamId]/attendance` | `/app/teams/[teamId]/attendance` |
| `/app/[teamId]/attendance/create` | `/app/teams/[teamId]/attendance/create` |
| `/app/[teamId]/attendance/[activityId]` | `/app/teams/[teamId]/attendance/[activityId]` |

## Implementation Steps

### 1. Create New Directory Structure
- Create new directories for the correct route pattern:
  ```
  mkdir -p apps/webapp/src/app/app/teams/[teamId]/attendance/create
  mkdir -p apps/webapp/src/app/app/teams/[teamId]/attendance/[activityId]
  ```

### 2. Copy Existing Files to New Structure
- Copy the existing files to the new directory structure:
  ```
  cp apps/webapp/src/app/app/[teamId]/attendance/page.tsx apps/webapp/src/app/app/teams/[teamId]/attendance/page.tsx
  cp apps/webapp/src/app/app/[teamId]/attendance/create/page.tsx apps/webapp/src/app/app/teams/[teamId]/attendance/create/page.tsx
  cp apps/webapp/src/app/app/[teamId]/attendance/[activityId]/page.tsx apps/webapp/src/app/app/teams/[teamId]/attendance/[activityId]/page.tsx
  ```

### 3. Create or Update Layout File
- Create a new layout file for the team-specific routes at the correct path:
  ```
  cp apps/webapp/src/app/app/[teamId]/layout.tsx apps/webapp/src/app/app/teams/[teamId]/layout.tsx
  ```
- Update the layout file to use the correct route patterns

### 4. Update Component References

#### In the New Files:
- Replace all instances of `/app/${teamId}/attendance` with `/app/teams/${teamId}/attendance`
- Update all link references and router.push() calls to use the new pattern

#### In Existing Components:
- Update the following components to use the correct URL pattern:
  - `AttendanceList.tsx`
  - `AttendanceCalendar.tsx`
  - `AttendanceForm.tsx`
  - `AttendanceMarkingTable.tsx`
  - `app/attendance/page.tsx` (central attendance view)

### 5. Add Temporary Redirects in Old Routes
- Add redirect pages at the old locations that redirect to the new locations
- This ensures backward compatibility until the old routes can be safely removed

### 6. Test New Routes
- Test all routes to ensure they work correctly:
  - Navigation to team attendance list
  - Creating new attendance activities
  - Viewing specific attendance activities
  - Navigation between team and attendance features

### 7. Component Fix List

| Component | Changes Needed |
|-----------|---------------|
| TeamLayout | Update navItems href values |
| AttendanceList | Update handleViewAttendance and handleCreateActivity methods |
| AttendanceCalendar | Update handleSelectEvent method |
| AttendanceForm | Update router.push() call on form submission |
| AttendanceMarkingTable | No changes needed (doesn't contain direct navigation) |
| app/attendance/page.tsx | Update handleTeamSelect, handleCreateAttendance, and handleViewAttendance methods |
| TeamCard.tsx | Update onClick handlers for attendance-related buttons |

## Next Steps
Once the correct route structure is in place and all components are updated to use it, we can:
1. Monitor for any issues or edge cases
2. Remove the old routes when we're confident they're no longer needed
3. Update documentation to reflect the correct route structure 