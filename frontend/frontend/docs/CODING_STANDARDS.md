# YVI Enterprise Workforce System (EWS) - Coding Standards & Best Practices

## Overview

This document outlines the coding standards, best practices, and quality guidelines for the YVI Enterprise Workforce System. All contributors should follow these standards to maintain code consistency, security, and maintainability.

## JavaScript/TypeScript Standards

### Code Style

#### Formatting
- **Indentation**: 2 spaces (not tabs)
- **Line Length**: Maximum 100 characters
- **Semicolons**: Required
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Trailing Commas**: In multiline objects/arrays

#### Naming Conventions
- **Variables/Functions**: camelCase
- **Classes/Components**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private Properties**: _underscorePrefix
- **TypeScript Interfaces**: PascalCase with 'I' prefix (optional)

```javascript
// Good examples
const maxUsers = 100;
const API_ENDPOINT = '/api/users';
class UserController {}
function calculateTotal() {}
const _privateVariable = 'value';
```

#### File Naming
- **JavaScript/TypeScript**: lowercase-with-dashes.js
- **React Components**: PascalCase.tsx (e.g., UserProfile.tsx)
- **Tests**: filename.test.js or filename.spec.js
- **Configuration**: lowercase.config.js

### TypeScript Best Practices

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
}

// Use types for unions and primitives
type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING';

// Define function signatures
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

#### Type Safety
- Always use strict typing
- Avoid `any` type when possible
- Use union types for limited options
- Implement proper error handling with types

### Error Handling

#### Backend Error Handling
```javascript
// Consistent error response format
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error middleware
const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
```

#### Frontend Error Handling
```typescript
// API service error handling
const apiCall = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
```

## React/Component Standards

### Component Structure
```tsx
// Functional components with TypeScript
interface Props {
  title: string;
  description?: string;
}

const ComponentName: React.FC<Props> = ({ title, description }) => {
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};
```

### Hooks Best Practices
- Use custom hooks for reusable logic
- Follow the Rules of Hooks
- Use TypeScript with hooks when appropriate

```tsx
// Custom hook example
const useApiData = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCall<T>(url);
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

### State Management
- Use React state for component-specific data
- Use Context for global state when appropriate
- Consider external state management libraries for complex applications

## Backend API Standards

### Route Structure
```javascript
// RESTful API endpoints
// GET /api/users - Get all users
// GET /api/users/:id - Get specific user
// POST /api/users - Create user
// PUT /api/users/:id - Update user
// DELETE /api/users/:id - Delete user
```

### Controller Pattern
```javascript
// Controllers should be focused and modular
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    next(error);
  }
};
```

### Service Layer Pattern
```javascript
// Services handle business logic
class UserService {
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  static async create(userData) {
    // Business logic validation
    this.validateUserData(userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  static validateUserData(userData) {
    // Validation logic
    if (!userData.email) {
      throw new Error('Email is required');
    }
  }
}
```

## Security Best Practices

### Input Validation
- Always validate and sanitize user input
- Use schema validation libraries (e.g., Zod, Joi)
- Implement server-side validation even with client-side validation

```javascript
// Example with Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2).max(100),
  age: z.number().min(18).max(100)
});

const validateUser = (userData) => {
  try {
    return userSchema.parse(userData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors[0].message}`);
    }
    throw error;
  }
};
```

### Authentication & Authorization
- Use JWT tokens with proper expiration
- Implement role-based access control
- Validate tokens on protected routes
- Use secure token storage

### SQL Injection Prevention
- Use parameterized queries
- Use ORM/Query builder when possible
- Validate and sanitize all inputs

## Testing Standards

### Unit Testing
- Write tests for all business logic
- Aim for 80%+ code coverage
- Test edge cases and error conditions
- Use descriptive test names

### Integration Testing
- Test API endpoints
- Test database interactions
- Test authentication flows
- Test authorization rules

## Performance Considerations

### Frontend Performance
- Optimize bundle size
- Implement code splitting
- Use lazy loading for components
- Optimize images and assets
- Implement proper caching strategies

### Backend Performance
- Use database indexing appropriately
- Implement pagination for large datasets
- Use connection pooling
- Cache frequently accessed data
- Optimize database queries

## Documentation Standards

### Code Comments
- Use JSDoc for functions and classes
- Comment complex logic
- Keep comments up to date
- Avoid obvious comments

```javascript
/**
 * Calculate the total compensation for an employee
 * @param {Object} employee - Employee object with salary and bonuses
 * @param {number} employee.salary - Base salary
 * @param {number} employee.bonus - Annual bonus
 * @returns {number} Total compensation
 */
const calculateTotalCompensation = (employee) => {
  return employee.salary + (employee.bonus || 0);
};
```

### API Documentation
- Document all API endpoints
- Include request/response examples
- Document authentication requirements
- Document error responses

## Code Review Checklist

### Security
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] No hardcoded secrets
- [ ] Proper error handling

### Performance
- [ ] Efficient database queries
- [ ] Proper caching strategies
- [ ] Optimized rendering (frontend)
- [ ] No unnecessary re-renders

### Code Quality
- [ ] Follows established patterns
- [ ] Proper error handling
- [ ] Clean, readable code
- [ ] Appropriate test coverage

### Functionality
- [ ] Meets requirements
- [ ] Handles edge cases
- [ ] Proper validation
- [ ] Correct business logic

## Git Standards

### Commit Messages
- Use conventional commits format
- Start with verb in present tense
- Be descriptive but concise
- Reference issue numbers when applicable

```
feat: add user authentication functionality
fix: resolve issue with user profile updates
docs: update API documentation
test: add unit tests for user service
```

### Branching Strategy
- Use feature branches for new functionality
- Use develop/main branch for releases
- Keep branches focused on single purpose
- Delete branches after merging

## Environment Management

### Environment Variables
- Never commit secrets to repository
- Use .env.example for documentation
- Validate required environment variables
- Use different configurations for environments

### Database Migrations
- Version control database schema changes
- Test migrations in development first
- Have rollback procedures ready
- Document breaking changes

## Monitoring and Logging

### Logging Standards
- Use structured logging
- Include relevant context
- Different log levels for different scenarios
- Avoid logging sensitive information

### Monitoring
- Monitor API response times
- Track error rates
- Monitor resource usage
- Set up alerts for critical issues

## Security Audit Checklist

### Regular Security Checks
- [ ] Dependency vulnerability scans
- [ ] Authentication implementation
- [ ] Authorization rules
- [ ] Input validation
- [ ] Data sanitization
- [ ] Secure headers
- [ ] Rate limiting
- [ ] Session management

### Data Protection
- [ ] Sensitive data encryption
- [ ] Proper access controls
- [ ] Audit logging
- [ ] Data retention policies
- [ ] GDPR compliance

## Code Quality Tools

### Linting
- ESLint for JavaScript/TypeScript
- Prettier for code formatting
- Consistent configuration across team

### Type Checking
- TypeScript for type safety
- Strict mode enabled
- Proper type definitions

### Automated Testing
- Unit tests with Jest
- Integration tests
- End-to-end tests for critical flows
- Code coverage monitoring

---

*This document should be updated as the project evolves and new standards are established.*