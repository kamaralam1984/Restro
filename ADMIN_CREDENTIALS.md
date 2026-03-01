# Admin Login Credentials

## Default Admin Account

**Email:** `admin@silverplet.com`  
**Password:** `Admin@123`

## Setup Instructions

### 1. Create Admin User

Run this command in the backend directory:

```bash
cd backend
npm run create-admin
```

This will create the default admin user in the database.

### 2. Login to Admin Panel

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter credentials:
   - Email: `admin@silverplet.com`
   - Password: `Admin@123`

### 3. Change Default Password

After first login, it's recommended to change the password through the settings page.

## Custom Admin Credentials

To create an admin with custom credentials, set environment variables:

```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourSecurePassword123
```

Then run:
```bash
npm run create-admin
```

## API Endpoint

Admin login endpoint: `POST /api/admin/login`

Request body:
```json
{
  "email": "admin@silverplet.com",
  "password": "Admin@123"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@silverplet.com",
    "role": "admin"
  }
}
```

## Security Notes

⚠️ **Important:**
- Change the default password in production
- Use strong passwords (min 8 characters, mix of letters, numbers, symbols)
- Never commit `.env` files with real credentials
- Use environment variables for all sensitive data

