# Admin Guide

## Overview

The admin system provides elevated permissions for managing articles and users across the platform.

## Admin Configuration

### Setting Up Admins

Add admin email addresses to your environment variables:

```env
# In .env file
ADMIN_EMAILS="admin1@example.com,admin2@example.com,your-email@example.com"
```

### Verification

To verify admin configuration:

```bash
npm run test-database
```

This will show which emails are configured as admins.

## Admin Permissions

### Article Management

**✅ Admins Can:**
- Edit any article (regardless of author)
- Delete any article
- Publish/unpublish any article
- Manage categories
- View all articles in dashboard

**❌ Regular Users Can:**
- Only edit their own articles
- Only delete their own articles
- Only manage their own content

### User Interface

When an admin edits another user's article, the interface shows:
```
Editing [Author Name]'s article (Admin access)
```

## Security Implementation

### Database Level
```sql
-- Prisma query for article updates
WHERE: {
  id: articleId,
  ...(userIsAdmin ? {} : { author_id: user.id })
}
```

### Page Level Protection
- Non-admins can't access edit pages for others' articles
- Returns 404 if unauthorized access attempted

### API Level Protection
- All API routes check admin status
- Triple-layer security (Page → Action → API)

## Admin Functions

### Available in Code

```typescript
import { isAdmin, requireAdmin, isAdminEmail } from '@/lib/admin'

// Check if user is admin
const userIsAdmin = isAdmin(user.email)

// Require admin access (throws error if not admin)
requireAdmin(user.email)

// Check specific email
const emailIsAdmin = isAdminEmail('test@example.com')
```

## Troubleshooting

### Common Issues

1. **Admin not working**
   - Check `ADMIN_EMAILS` environment variable
   - Ensure email matches exactly (case-insensitive)
   - Verify environment variables are loaded

2. **Can't edit others' articles**
   - Confirm you're logged in with admin email
   - Check that email is in `ADMIN_EMAILS` list
   - Restart application after environment changes

3. **Environment variables not loading**
   - Check `.env` file exists in root directory
   - Verify no syntax errors in `.env`
   - Restart development server

### Debug Commands

```javascript
// In browser console (development only)
console.log('Admin emails configured:', process.env.ADMIN_EMAILS)

// Check current user admin status
// (Add to a debug page if needed)
```

## Best Practices

### Security
- Use work emails for admin accounts
- Don't hardcode admin emails in source code
- Regularly review admin list
- Use environment-specific admin lists

### Management
- Keep admin list minimal (2-3 people max)
- Document admin responsibilities
- Use role-based admin levels if needed in future
- Regular access reviews

## Future Enhancements

### Planned Features
- Role-based permissions (Editor, Admin, Super Admin)
- Admin activity logging
- Granular permissions system
- Admin dashboard with analytics

### Implementation Ideas
```typescript
// Future role system
enum AdminRole {
  EDITOR = 'editor',     // Can edit others' articles
  ADMIN = 'admin',       // Full article management
  SUPER_ADMIN = 'super'  // User management + all admin
}
```

## Environment Examples

### Development
```env
ADMIN_EMAILS="dev@knnsyndicate.com,test@example.com"
```

### Production
```env
ADMIN_EMAILS="admin@knnsyndicate.com,editor@knnsyndicate.com"
```

### Testing
```env
ADMIN_EMAILS="test-admin@example.com"
```


