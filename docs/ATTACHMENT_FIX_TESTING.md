# Attachment Visibility Fix Testing Guide

## Issue Fixed
Tasks opened from the dashboard were not showing their attachments when the TaskDialog opened in edit mode.

## Root Cause
The TaskDialog was resetting attachments to empty array on open but never loading existing attachments for edit mode.

## Solution Implemented
1. Added `fetchTaskAttachments` function to load attachments from API
2. Modified useEffect to call `fetchTaskAttachments` for edit mode
3. Added tab-switching refresh for attachments in edit mode

## Testing Steps

### Manual Test Procedure
1. **Setup**: Ensure you have a task with attachments
   - Go to Tasks page
   - Open any task 
   - Upload an attachment
   - Close the task

2. **Test Dashboard Click**:
   - Go to Dashboard page
   - Find the task with attachments in any section (Recent Tasks, Filtered Tasks, or Upcoming Deadlines)
   - Click on the task title (this should open TaskDialog in edit mode)
   
3. **Verify Attachment Visibility**:
   - The TaskDialog should open in edit mode
   - Switch to the "Attachments" tab
   - ✅ **EXPECTED**: Attachments should be visible and loadable
   - ❌ **BEFORE FIX**: Attachments were not visible (empty list)

4. **Test Attachment Functionality**:
   - Try downloading an attachment (should work)
   - Try uploading a new attachment (should work)
   - Try deleting an attachment if you're the uploader (should work)

5. **Test Refresh**:
   - Switch to another tab and back to Attachments
   - ✅ **EXPECTED**: Attachments should still be visible and up-to-date

### Comparison Test
- **From Tasks Page**: Open same task from Tasks page → TaskDialog edit mode → Attachments visible ✅
- **From Dashboard**: Open same task from Dashboard → TaskDialog edit mode → Attachments visible ✅

## Code Changes
- Modified: `src/components/tasks/task-dialog.tsx`
  - Added `fetchTaskAttachments` function
  - Updated form reset useEffect logic
  - Added attachment refresh on tab switch

## Expected Outcome
✅ Attachments are now visible when opening tasks from dashboard
✅ Maintains consistent behavior between dashboard and tasks page
✅ Proper error handling for failed attachment loading
✅ Fresh attachment data when switching tabs
