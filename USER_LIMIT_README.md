# 11Mercado User Limit System

## Overview
The 11Mercado PTA hub now implements a **100 concurrent user limit** to ensure optimal performance and resource management.

## How It Works

### User Session Management
- **Maximum Users**: 100 concurrent sessions
- **Session Timeout**: 30 minutes of inactivity
- **Automatic Cleanup**: Expired sessions removed every 5 minutes
- **Persistent Storage**: Sessions stored in localStorage for reliability

### User Experience

#### When Access is Granted
- Users see a success message with their position (e.g., "You are user 45 of 100")
- Small user counter appears in top-right corner showing current usage
- Session automatically maintained with periodic activity updates

#### When Limit is Reached
- Users see a friendly "Access Limit Reached" screen
- Real-time display of current usage (e.g., "100/100 users")
- Visual progress bar showing capacity usage
- "Try Again" button to check for available slots
- Helpful tips about peak usage times and session timeouts

### Technical Features

#### Session Management
- Unique session IDs generated for each user
- Activity tracking every 2 minutes
- Automatic session cleanup on browser close
- Graceful handling of expired sessions

#### Admin Monitoring
Access the admin dashboard by visiting: `http://localhost:5173/?admin=monitor`

**Admin Features:**
- Real-time user count monitoring
- Usage percentage with color-coded warnings
- Auto-refresh every 5 seconds (toggleable)
- System status information
- Session timeout and cleanup settings
- Visual capacity usage bar
- Warning alerts at 70% and 90% capacity

## Usage Instructions

### For Regular Users
1. Open the 11Mercado app normally
2. If under 100 users, you'll be granted immediate access
3. If at capacity, wait for the "Try Again" button or refresh later
4. Your session remains active for 30 minutes of inactivity

### For Administrators
1. Access admin monitor: `?admin=monitor`
2. Monitor real-time usage statistics
3. Watch for high usage warnings
4. Track session cleanup effectiveness

## Implementation Details

### Files Created/Modified
- `src/utils/userSessionManager.ts` - Core session management logic
- `src/components/UserLimitGate.tsx` - Access control component
- `src/components/AdminMonitor.tsx` - Admin dashboard
- `src/App.tsx` - Integration with main app
- `src/components/MiniAppsGrid.tsx` - User limit notification

### Configuration
Current settings in `userSessionManager.ts`:
```typescript
private readonly MAX_USERS = 100;
private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

### Storage
- Sessions stored in `localStorage` with key `11mercado_sessions`
- Current user session stored in `11mercado_current_session`
- Data automatically cleaned up on session expiry

## Benefits

### Performance
- Prevents server overload by limiting concurrent users
- Maintains responsive user experience
- Automatic cleanup prevents memory leaks

### User Management
- Fair access distribution with timeout system
- Clear communication about access status
- Graceful degradation when limits reached

### Monitoring
- Real-time visibility into system usage
- Proactive warnings before capacity reached
- Historical insight through admin dashboard

## Troubleshooting

### Common Issues
1. **Stuck at checking access**: Refresh the page
2. **Session expired message**: Normal behavior after 30 min inactivity
3. **Can't access when count shows available**: Clear localStorage and refresh

### Admin Actions
1. Monitor usage patterns via admin dashboard
2. Check for cleanup effectiveness
3. Adjust timeout values if needed (requires code change)

## Security Considerations

- No sensitive data stored in sessions
- Session IDs are randomly generated
- Automatic cleanup prevents session accumulation
- Admin access only via URL parameter (can be secured further)

This implementation provides a robust, user-friendly way to manage concurrent access while maintaining the app's functionality and user experience.