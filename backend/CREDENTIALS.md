# Default Login Credentials

## After Fresh Installation

When the application starts for the first time, it automatically creates the following users:

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Full system access including user management

### Regular User Accounts

**User 1:**
- **Email:** john@example.com
- **Password:** password123
- **Role:** User

**User 2:**
- **Email:** jane@example.com
- **Password:** password123
- **Role:** User

## Security Notes

⚠️ **IMPORTANT:** Change these default passwords immediately after first login, especially in production environments!

## Resetting Users

To reset all users to default:

```bash
# Delete all users
docker exec -it jira_mongodb mongosh jira_dashboard --eval "db.users.deleteMany({})"

# Restart backend to trigger auto-seed
docker-compose restart backend
```

## Manual Seeding

```bash
docker exec -it jira_backend npm run seed-users
```