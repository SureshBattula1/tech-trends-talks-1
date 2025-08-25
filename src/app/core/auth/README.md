# Authentication System

This directory contains the complete authentication system for the Angular application.

## Components

### AuthService (`auth.service.ts`)
- Handles user login, logout, and registration
- Manages authentication state using BehaviorSubject
- Stores and retrieves JWT tokens and user data from localStorage
- Provides methods to check user roles and authentication status
- **Registration**: Automatically sets default role to 'user' and auto-logs in after successful registration

### AuthGuard (`auth.guard.ts`)
- Protects routes that require authentication
- Redirects unauthenticated users to the login page
- Implements CanActivate, CanActivateChild, and CanMatch interfaces

### RoleGuard (`role.guard.ts`)
- Protects routes based on user roles
- Can be configured with specific roles required for access
- Supports custom redirect paths for unauthorized access

### AuthInterceptor (`auth.interceptor.ts`)
- Automatically adds JWT tokens to all HTTP requests
- Handles 401 (Unauthorized) responses with token refresh
- Skips authentication for public endpoints (login, register, forgot-password)

## Usage

### Protecting Routes

```typescript
// Route requiring authentication
{
  path: 'protected',
  component: ProtectedComponent,
  canActivate: [AuthGuard]
}

// Route requiring specific role
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }
}
```

### Using in Components

```typescript
import { AuthService } from '../auth/auth.service';

constructor(private authService: AuthService) {}

// Check if user is authenticated
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Check user role
if (this.authService.isAdmin()) {
  // User has admin role
}

// Get current user
const user = this.authService.getCurrentUser();

// Logout
this.authService.logout();
```

### Observing Authentication State

```typescript
import { AuthService } from '../auth/auth.service';

constructor(private authService: AuthService) {}

ngOnInit() {
  this.authService.authState$.subscribe(authState => {
    if (authState.isAuthenticated) {
      // Handle authenticated state
    } else {
      // Handle unauthenticated state
    }
  });
}
```

## API Endpoints

The authentication system expects the following API endpoints:

- `POST /api/v1/login` - User login
- `POST /api/v1/register` - User registration
- `POST /api/v1/refresh` - Token refresh (optional)

## Request/Response Formats

### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "User Name",
      "firstname": "User",
      "lastname": "Name",
      "middle_name": "Michael",
      "email": "user@example.com",
      "role": "user",
      "email_verified_at": "2025-08-25T05:31:35.000000Z"
    },
    "access_token": "jwt_token_here",
    "token_type": "bearer"
  }
}
```

### Registration Request
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "middle_name": "Michael",
  "email": "johntest@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "user"
}
```

**Note**: The `role` field is optional and defaults to "user" if not provided.

## Security Features

- JWT tokens are automatically added to all HTTP requests
- Tokens are stored securely in localStorage
- Automatic token refresh on 401 responses
- Role-based access control
- Automatic logout on authentication failures
- Protection against unauthorized route access
- Password confirmation validation
- Form validation with error messages

## User Experience Features

- **Auto-login after registration**: Users are automatically logged in after successful registration
- **Role-based redirects**: Users are redirected to appropriate pages based on their role
- **Form validation**: Real-time validation with helpful error messages
- **Loading states**: Visual feedback during authentication processes
- **Password visibility toggle**: Users can show/hide passwords
- **Responsive design**: Works on all device sizes

## Configuration

The authentication system is automatically configured in `app.config.ts` and `app.routes.ts`. No additional configuration is required.

## Routes

- `/login` - User login page
- `/register` - User registration page  
- `/forgot-password` - Password reset page (placeholder)
- `/unauthorized` - Access denied page
- `/blogs` - Protected blog routes (requires authentication)
- `/blogs-admin/*` - Admin routes (requires admin role)
