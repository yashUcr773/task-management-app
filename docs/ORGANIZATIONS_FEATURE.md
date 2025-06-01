# Organizations Feature

## Overview
The Organizations feature allows users to create, manage, and join organizations for collaborative task management. This feature provides a comprehensive interface for managing team structures and member roles.

## Features Implemented

### 1. Organizations Page (`/organizations`)
- **Main View**: Grid layout displaying organization cards
- **Search Functionality**: Filter organizations by name or description
- **Tabbed Interface**: "My Organizations" and "All Organizations" tabs
- **Navigation Integration**: Added to main app navigation

### 2. Organization Management
- **Create Organization**: Dialog to create new organizations with name and description
- **Join Organization**: Dialog to join existing organizations using invite codes
- **Edit Organization**: Admin-only dialog to update organization details
- **Leave Organization**: Option to leave organizations (with admin protection)

### 3. Member Management
- **Role-Based Access**: Three roles - USER, MODERATOR, ADMIN
- **Member Display**: Avatar lists with overflow handling for large teams
- **Role Management**: Admin can change member roles and remove members
- **Admin Protection**: Prevents removal/demotion of last admin

### 4. Organization Cards Display
- **Organization Stats**: Member count, team count, epic count
- **Role Indicators**: Crown icons for admins, role badges
- **Action Menus**: Context-sensitive dropdown menus
- **Quick Actions**: Copy invite links, manage members, edit details

## API Endpoints

### Organizations
- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create new organization
- `PATCH /api/organizations/[id]` - Update organization (admin only)
- `POST /api/organizations/join` - Join organization with invite code
- `POST /api/organizations/[id]/leave` - Leave organization

### Members
- `GET /api/organizations/[id]/members` - List organization members
- `PATCH /api/organizations/[id]/members/[memberId]` - Update member role (admin only)
- `DELETE /api/organizations/[id]/members/[memberId]` - Remove member (admin only)

## User Roles

### ADMIN
- Create and edit organization details
- Manage all members (add, remove, change roles)
- Cannot leave if they're the last admin
- Full access to all organization features

### MODERATOR
- View all organization information
- Limited management capabilities (future feature)
- Cannot edit organization settings

### USER
- View organization information
- Basic participation in organization activities
- Cannot manage other members

## Components Structure

```
src/components/organizations/
├── organizations-view.tsx          # Main organizations page component
├── create-organization-dialog.tsx  # Dialog for creating organizations
├── join-organization-dialog.tsx    # Dialog for joining organizations
├── edit-organization-dialog.tsx    # Dialog for editing organization details
└── manage-organization-dialog.tsx  # Dialog for managing members and roles
```

## Security Features

1. **Authentication Required**: All endpoints require valid session
2. **Role-Based Permissions**: Actions restricted based on user role
3. **Admin Protection**: Prevents organizations from losing all admins
4. **Input Validation**: All inputs validated using Zod schemas
5. **Error Handling**: Comprehensive error handling with user feedback

## UI/UX Features

1. **Responsive Design**: Works on all screen sizes
2. **Loading States**: Proper loading indicators during operations
3. **Error Feedback**: Toast notifications for success/error states
4. **Confirmation Dialogs**: Confirmation for destructive actions
5. **Accessible UI**: Proper ARIA labels and keyboard navigation
6. **Modern Design**: Consistent with app's design system

## Future Enhancements

1. **Invite System**: Generate and manage invite codes with expiration
2. **Organization Settings**: Advanced organization configuration
3. **Bulk Operations**: Bulk member management
4. **Organization Templates**: Pre-configured organization types
5. **Activity Logs**: Track organization member activities
6. **Public Organizations**: Discovery of public organizations

## Testing

The organizations feature has been tested for:
- Organization creation and management
- Member role management
- Permission enforcement
- Error handling and edge cases
- UI responsiveness and accessibility

## Getting Started

1. Navigate to `/organizations` in the app
2. Click "Create Organization" to start a new organization
3. Use "Join Organization" to join existing organizations with invite codes
4. Manage members and roles using the organization cards' action menus
5. Admins can edit organization details and manage all members
