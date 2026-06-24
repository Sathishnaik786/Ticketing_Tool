# Contributing to YVI Enterprise Workforce System (EWS)

Thank you for your interest in contributing to the YVI Enterprise Workforce System! We appreciate your help in making this project better.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Guidelines](#code-guidelines)
- [Security Guidelines](#security-guidelines)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- Supabase account for local development

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YVI_EWS.git
   cd YVI_EWS
   ```

3. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/YVI_EWS.git
   ```

4. Install dependencies for both frontend and backend:
   ```bash
   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your Supabase credentials
   
   # Frontend
   cd ../frontend
   npm install
   cp .env.example .env
   # Update .env with your API URL
   ```

5. Run the development servers:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (in a separate terminal)
   cd frontend
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-description
   ```

2. Make your changes following the code guidelines below

3. Test your changes thoroughly

4. Commit your changes with a descriptive commit message:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue description"
   ```

5. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. Ensure your code follows the project's coding standards and security guidelines

2. Update documentation as necessary

3. Add tests for new functionality (if applicable)

4. Ensure all tests pass

5. Create a pull request with:
   - A clear title that describes the changes
   - A detailed description of what was changed and why
   - Links to any related issues

6. Wait for review and address any feedback

## Code Guidelines

### JavaScript/TypeScript
- Use ESLint with the project's configuration
- Follow the existing code style
- Write clear, descriptive variable and function names
- Add JSDoc comments for public functions and complex logic
- Keep functions small and focused on a single responsibility

### React Components
- Use functional components with hooks
- Follow the folder structure conventions
- Keep components small and reusable
- Use TypeScript for type safety
- Follow naming conventions: `ComponentName.tsx`

### Backend API
- Follow RESTful API design principles
- Use consistent error response format
- Implement proper input validation
- Follow security best practices
- Use middleware for authentication and authorization

### Database
- Use meaningful table and column names
- Add proper indexes for frequently queried fields
- Follow naming conventions: `snake_case` for tables/columns
- Use proper data types and constraints

## Security Guidelines

### Authentication & Authorization
- Never store sensitive information in client-side code
- Always validate and sanitize user input
- Use parameterized queries to prevent SQL injection
- Implement proper RBAC checks for all API endpoints
- Use secure JWT practices with proper expiration

### Environment Variables
- Never commit secrets to the repository
- Use environment variables for configuration
- Follow the .env.example template
- Never hardcode credentials in source code

### Data Handling
- Implement proper data validation
- Use HTTPS in production
- Sanitize user-generated content
- Follow privacy best practices

## Reporting Issues

### Bug Reports
When reporting a bug, please include:
- A clear title and description
- Steps to reproduce the issue
- Expected vs. actual behavior
- Environment information (OS, browser, Node.js version)
- Screenshots or error messages if applicable

### Feature Requests
For feature requests, please include:
- A clear description of the proposed feature
- Use cases and benefits
- Potential implementation approach
- Any alternatives you've considered

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label or contact the maintainers directly.

Thank you for contributing to the YVI Enterprise Workforce System!