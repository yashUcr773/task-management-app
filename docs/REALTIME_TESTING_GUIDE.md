# Real-Time Task Management Testing Guide

## Setup Instructions

### 1. Start the WebSocket Server
```cmd
cd "c:\Github\yashUcr773\task-management-app"
node websocket-server.js
```

### 2. Start the Next.js Development Server
```cmd
cd "c:\Github\yashUcr773\task-management-app"
npm run dev
```

### 3. Open the Application
Navigate to: http://localhost:3000/tasks

## Testing Real-Time Features

### Connection Status
- Look for the connection status badge in the top toolbar
- **Green "Live" badge**: WebSocket connected successfully
- **Orange "Offline" badge**: WebSocket disconnected

### Real-Time Task Updates
The WebSocket server automatically simulates task updates every 10 seconds:

1. **Task Updates**: Existing tasks are randomly modified
2. **Status Changes**: Task statuses change between todo, in-progress, review, done
3. **New Tasks**: New auto-generated tasks are created
4. **Toast Notifications**: Real-time updates show toast messages

### Testing Different Views
1. **Kanban Board**: Watch for cards moving between columns
2. **Table View**: See rows update in real-time
3. **List View**: Observe task list changes
4. **Calendar View**: Tasks appear/disappear on calendar dates

### Manual Testing
You can test the WebSocket connection manually using browser dev tools:

```javascript
// Open browser console and run:
const ws = new WebSocket('ws://localhost:3001?userId=test&organizationId=org1');

ws.onopen = () => console.log('Connected to WebSocket');
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));

// Send a test message
ws.send(JSON.stringify({
  type: 'task_created',
  payload: {
    id: Date.now().toString(),
    title: 'Manual Test Task',
    status: 'todo',
    priority: 'high',
    organizationId: 'org1'
  }
}));
```

## Features Implemented

### Real-Time Hook (`useRealTimeTasks`)
- ✅ Automatic WebSocket connection management
- ✅ Real-time task updates (create, update, delete)
- ✅ Task filtering and search
- ✅ Loading states and error handling
- ✅ Task statistics calculation
- ✅ Overdue task detection

### Components Updated
- ✅ **TasksView**: Main container with real-time integration
- ✅ **TasksTable**: Supports real-time task data and loading states
- ✅ **TasksList**: Real-time task updates with skeleton loading
- ✅ **TasksCalendar**: Simplified calendar with real-time support

### WebSocket Infrastructure
- ✅ **WebSocketClient**: Connection management with reconnection
- ✅ **Real-time hooks**: Task updates, comments, notifications, presence
- ✅ **Test server**: Simulates real-time task updates

## Expected Behavior

### Initial Load
1. App shows loading skeletons while fetching data
2. WebSocket connection establishes (green "Live" badge)
3. Mock task data loads and displays

### Real-Time Updates
1. Every 10 seconds, you should see:
   - Toast notifications for task changes
   - Visual updates in the current view
   - Updated "Last updated" timestamp
   - Tasks moving between statuses in Kanban view

### Error Handling
1. If WebSocket disconnects: Orange "Offline" badge
2. Connection errors show in console
3. Automatic reconnection attempts
4. Error display with retry button

## Troubleshooting

### WebSocket Server Issues
- Ensure port 3001 is not in use
- Check Windows Firewall settings
- Verify Node.js is installed

### Application Issues
- Clear browser cache and reload
- Check browser console for errors
- Ensure all dependencies are installed

### Common Problems
1. **CORS issues**: WebSocket server allows all origins for testing
2. **Port conflicts**: Change port in `websocket-server.js` if needed
3. **TypeScript errors**: Run `npx tsc --noEmit` to check for issues

## Next Steps

1. **Backend Integration**: Replace mock data with real API calls
2. **Authentication**: Add user authentication to WebSocket connections  
3. **Presence System**: Show online users and typing indicators
4. **Advanced Filtering**: Add more filtering options for real-time data
5. **Performance**: Implement connection pooling and batch updates
6. **Mobile Support**: Test and optimize for mobile devices

## File Structure

```
src/
├── hooks/
│   ├── use-real-time-tasks.ts    # Main real-time tasks hook
│   └── use-websocket.ts          # WebSocket connection hooks
├── lib/
│   └── websocket.ts             # WebSocket client implementation
├── components/tasks/
│   ├── tasks-view.tsx           # Updated with real-time integration
│   ├── tasks-table.tsx          # Supports real-time props
│   ├── tasks-list.tsx           # Supports real-time props
│   └── tasks-calendar.tsx       # Simplified with real-time support
└── websocket-server.js          # Test WebSocket server
```
