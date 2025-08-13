# 🔒 Admin Dashboard Guide

## Access Codes
- **Student/User Access**: `MERCADO80` (for 80 concurrent users)
- **Admin Access**: `ADMIN2025` (for administrative monitoring)

## Admin Dashboard Features

### 🎯 Auto-Access
When you log in with the admin code (`ADMIN2025`), the admin dashboard automatically opens. You can also click the "Admin" button in the header to access it anytime.

### 📊 Overview Tab
- **Active Users**: Real-time count of logged-in users
- **Unresolved Errors**: Critical issues requiring attention
- **Average Session Duration**: User engagement metrics
- **Today's Sessions**: Daily usage statistics
- **Recent Activities**: Live activity feed from all users

### 👥 Active Users Tab
- **User Monitoring**: See all currently logged-in users
- **IP Tracking**: Monitor user IP addresses for security
- **Session Details**: Click on any user to see detailed session information
- **User Types**: Distinguish between students and admins
- **Activity Timestamps**: When users last interacted with the system

### 🚨 Error Logs Tab
- **Error Tracking**: Comprehensive error logging with stack traces
- **Filter Options**: View all, unresolved, or resolved errors
- **Error Resolution**: Mark errors as resolved
- **User Context**: See which user encountered each error
- **Component Tracking**: Identify which parts of the app have issues

### 📈 Activities Tab
- **User Activity Logs**: Detailed logs of all user actions
- **Component Interactions**: Track which features users access
- **Success/Failure Tracking**: Monitor operation success rates
- **Session Management**: See login, logout, and session events

### 🤖 AI Assistant (Chat Panel)
The AI assistant helps you understand and resolve issues:

#### Available Commands:
- `"Show me current errors"` - Get error analysis
- `"What's the user activity?"` - User statistics overview
- `"Performance status"` - System performance analysis
- `"Security status"` - Security overview and recommendations
- `"Help"` - Show all available commands

#### AI Capabilities:
- **Error Analysis**: Explains what errors mean and how to fix them
- **Performance Monitoring**: Identifies system bottlenecks
- **Security Insights**: Monitors for suspicious activity patterns
- **Usage Analytics**: Provides insights into user behavior
- **Troubleshooting**: Step-by-step problem resolution

## System Monitoring

### Real-Time Metrics
- **User Capacity**: 80 concurrent users maximum
- **Session Timeout**: 15 minutes of inactivity
- **Auto-Refresh**: Dashboard updates every 5 seconds
- **Error Tracking**: Automatic logging of all system errors

### Security Features
- **IP Address Tracking**: Monitor user locations
- **Session Management**: Automatic cleanup of expired sessions
- **Access Control**: Separate admin and user access codes
- **Activity Monitoring**: Log all user interactions

### Data Storage
- **Local Storage**: Session data persists in browser
- **Error Logs**: Up to 500 recent errors stored
- **Activity Logs**: Last 100 activities per user session
- **Session History**: Tracks daily usage patterns

## Quick Actions

### For High User Load (>60 users):
1. Monitor performance metrics
2. Check for session timeout issues
3. Consider notifying users about capacity

### For Multiple Errors:
1. Check Error Logs tab
2. Use AI assistant to analyze patterns
3. Mark resolved errors to keep logs clean
4. Monitor component-specific issues

### For Security Concerns:
1. Review IP addresses for unusual patterns
2. Check for failed login attempts in error logs
3. Monitor session durations for anomalies
4. Use AI assistant for security analysis

## Best Practices

1. **Regular Monitoring**: Check dashboard at least twice daily
2. **Error Resolution**: Address unresolved errors promptly
3. **Capacity Management**: Monitor user loads during peak hours
4. **Security Vigilance**: Review IP patterns and session activities
5. **AI Consultation**: Use the AI assistant for complex issues

## Troubleshooting

### If Dashboard Won't Load:
- Verify admin access code: `ADMIN2025`
- Check browser console for JavaScript errors
- Clear browser cache and try again

### If Data Seems Incorrect:
- Click the refresh button (🔄) in the header
- Check if localStorage is enabled in browser
- Verify network connectivity for IP tracking

### If AI Assistant Isn't Responding:
- The AI provides context-aware responses based on current system state
- Try asking more specific questions
- Use the help command to see available options

## Access Information
- **Admin Code**: `ADMIN2025`
- **User Code**: `MERCADO80`
- **Max Users**: 80 concurrent
- **Session Timeout**: 15 minutes
- **Auto-Refresh**: Every 5 seconds

---

*The admin dashboard provides comprehensive monitoring and management capabilities for the 11Mercado educational platform.*