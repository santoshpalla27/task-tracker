# Testing Checklist

## Authentication Tests

### Registration
- [ ] Register with valid data
- [ ] Register with duplicate email
- [ ] Register with duplicate username
- [ ] Register with weak password
- [ ] Register with invalid email

### Login
- [ ] Login with correct credentials
- [ ] Login with incorrect password
- [ ] Login with non-existent email
- [ ] Login with inactive account
- [ ] Token persistence after refresh

### Profile
- [ ] View profile
- [ ] Update profile information
- [ ] Change password with correct current password
- [ ] Change password with incorrect current password
- [ ] Upload avatar

## Admin Features Tests

### User Management
- [ ] View user list
- [ ] Search users
- [ ] Filter by role
- [ ] Filter by status
- [ ] Create new user
- [ ] Edit user information
- [ ] Toggle user status
- [ ] Delete user
- [ ] Pagination works correctly

### Statistics
- [ ] View total users
- [ ] View active users
- [ ] View inactive users
- [ ] View admin count
- [ ] View recent registrations

## Task Management Tests

### Kanban Board
- [ ] View tasks grouped by status
- [ ] Drag and drop tasks
- [ ] Create new task
- [ ] Edit task
- [ ] Delete task
- [ ] Task persists after refresh

### Todo List
- [ ] Create todo
- [ ] Edit todo
- [ ] Toggle completion
- [ ] Delete todo
- [ ] Convert todo to task

## Security Tests

### Authorization
- [ ] Access protected routes without login (should redirect)
- [ ] Access admin routes as regular user (should deny)
- [ ] Token expiration handling
- [ ] Refresh token after expiration

### Input Validation
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints

## UI/UX Tests

### Responsive Design
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)

### Dark Mode
- [ ] Toggle dark mode
- [ ] Persistence after refresh
- [ ] All components render correctly

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Focus indicators
- [ ] Color contrast

## Performance Tests

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Smooth animations
- [ ] No memory leaks

## Browser Compatibility

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge