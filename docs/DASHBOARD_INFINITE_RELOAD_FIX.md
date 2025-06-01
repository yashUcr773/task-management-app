# Dashboard Infinite Reload Fix

## Issue
Clicking on the "Completed" card in the dashboard overview was causing an infinite reload when redirecting to `/tasks?status=RELEASED`.

## Root Cause
The issue was in the `TasksView` component where the `hookOptions` object passed to `useRealTimeTasks` was being recreated on every render. This caused the hook's dependencies to change constantly, triggering infinite re-renders and API calls.

### Problem Code:
```tsx
const hookOptions = {
  organizationId: 'org1',
  enableRealTime: true,
  showToasts: true,
  showArchived,
  ...(statusFilter && { status: [statusFilter] })
}
```

## Solution
Wrapped the `hookOptions` object in `useMemo` to prevent unnecessary recreations:

### Fixed Code:
```tsx
const hookOptions = useMemo(() => ({
  organizationId: 'org1',
  enableRealTime: true,
  showToasts: true,
  showArchived,
  ...(statusFilter && { status: [statusFilter] })
}), [showArchived, statusFilter])
```

## Changes Made
1. **Added `useMemo` import** to the TasksView component
2. **Memoized `hookOptions`** with proper dependencies (`showArchived` and `statusFilter`)

## Result
- ✅ Clicking "Completed" in dashboard now properly navigates to filtered tasks view
- ✅ No more infinite reload loops
- ✅ All other dashboard card links continue to work correctly
- ✅ Real-time functionality preserved

## Files Modified
- `src/components/tasks/tasks-view.tsx`

## Testing
- Dashboard "Completed" card navigation now works correctly
- Other status filters (IN_DEV, overdue) also work properly
- Real-time updates continue to function as expected
