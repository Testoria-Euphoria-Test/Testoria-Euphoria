# API Endpoints Summary

## Complete Endpoint Reference Table

| Method | Endpoint | Access Level | Middleware | Purpose | Request Body | Key Response |
|--------|----------|--------------|------------|---------|--------------|--------------|
| **AUTHENTICATION** |
| POST | `/api/register` | Public | ❌ | Register new user | User details | User object + ID |
| POST | `/api/login` | Public | ❌ | User login | Email, password | User + JWT token |
| **USER MANAGEMENT** |
| GET | `/api/users/{id}` | Protected | ✅ | Get user by ID | - | User details |
| PUT | `/api/users/{id}` | Protected | ✅ | Update user | User updates | Updated user |
| **PROFILE MANAGEMENT** |
| GET | `/api/profiles/me` | Protected | ✅ | Get my profile | - | Profile details |
| PUT | `/api/profiles/me` | Protected | ✅ | Update my profile | Profile updates | Updated profile |
| GET | `/api/profiles/{id}` | Public | ❌ | Get public profile | - | Public profile |
| **CATEGORY MANAGEMENT** |
| GET | `/api/categories` | Public | ❌ | List all categories | - | Categories array |
| POST | `/api/categories` | Public | ❌ | Create category | Category details | Category ID |
| GET | `/api/categories/{id}` | Public | ❌ | Get category details | - | Category + packages |
| **PACKAGE MANAGEMENT** |
| GET | `/api/packages` | Public | ❌ | List published packages | - | Packages + pagination |
| GET | `/api/packages/{id}` | Public | ❌ | Get package details | - | Package details |
| POST | `/api/packages` | Protected | ✅ | Create package | Package details | Package ID |
| PUT | `/api/packages/{id}` | Protected | ✅ | Update package | Package updates | Updated package |
| GET | `/api/packages/my-packages` | Protected | ✅ | Get my packages | - | My packages + stats |
| POST | `/api/packages/{id}/process` | Protected | ✅ | Process with AI | - | AI extracted content |
| POST | `/api/packages/{id}/publish` | Protected | ✅ | Publish package | - | Published package |
| POST | `/api/packages/{id}/reupload` | Protected | ✅ | Reupload PDF | New PDF URL | Updated package |
| **PAYMENT MANAGEMENT** |
| POST | `/api/payments` | Protected | ✅ | Create payment | Package ID | Payment + Midtrans token |
| GET | `/api/payments/{id}` | Protected | ✅ | Get payment details | - | Payment details |
| POST | `/api/payments/notify` | Public | ❌ | Midtrans webhook | Midtrans data | Processing status |
| **QUESTION MANAGEMENT** |
| POST | `/api/questions` | Protected | ✅ | Create from package | Package ID | Questions array |
| GET | `/api/questions` | Public | ❌ | Get questions | packageId param | Questions array |
| POST | `/api/questions/manual` | Protected | ✅ | Create manually | Question details | Question ID |
| PUT | `/api/questions/manual` | Protected | ✅ | Update question | Question updates | Success message |
| DELETE | `/api/questions/manual` | Protected | ✅ | Delete question | questionId param | Success message |
| **USER ANSWERS** |
| POST | `/api/user-answers` | Protected | ✅ | Submit quiz answers | Package + answers | Submission details |
| GET | `/api/user-answers` | Protected | ✅ | Get user answers | packageId param | User answers array |
| **RESULTS & ANALYTICS** |
| POST | `/api/results` | Protected | ✅ | Generate result | Package ID | Result + AI feedback |
| GET | `/api/results` | Protected | ✅ | Get results | packageId param | Results array |
| **AI INTEGRATION** |
| POST | `/api/test-ai` | Public | ❌ | Test AI processing | Content to process | Processed results |

## Access Level Definitions

| Level | Description | Authentication | Ownership Check |
|-------|-------------|---------------|----------------|
| **Public** | No authentication required | ❌ | ❌ |
| **Protected** | JWT token required | ✅ | ❌ |
| **Owner** | JWT token + resource ownership | ✅ | ✅ |

## Middleware Protection Patterns

### Protected Paths (Require JWT)
```typescript
'/api/users/:path*'           // User management
'/api/profiles/:path*'        // Profile management  
'/api/packages/:path*'        // Package management
'/api/payments/:path*'        // Payment management
'/api/questions/:path*'       // Question management
'/api/user-answers/:path*'    // User answers
'/api/results/:path*'         // Results & analytics
'/api/test-ai/:path*'         // AI testing
```

### Public Exceptions (No JWT Required)
```typescript
GET  /api/packages            // Browse published packages
GET  /api/packages/{id}       // View package details
GET  /api/categories          // List categories
POST /api/categories          // Create category
GET  /api/categories/{id}     // View category
GET  /api/profiles/{id}       // View public profile (not /me)
GET  /api/questions           // View questions (for purchased)
POST /api/payments/notify     // Midtrans webhook
POST /api/test-ai             // AI testing (development)
```

## HTTP Methods Usage

| Method | Usage | Purpose |
|--------|-------|---------|
| **GET** | Retrieve data | Fetch resources, lists, details |
| **POST** | Create new | Create resources, submit data |
| **PUT** | Update existing | Modify resources, update data |
| **DELETE** | Remove | Delete resources |

## Standard Request Headers

### For Protected Endpoints
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### For Public Endpoints
```http
Content-Type: application/json
```

### Webhook Endpoints
```http
Content-Type: application/json
X-Callback-Token: <signature>  # For payment webhooks
```

## Standard Response Structure

### Success Response
```json
{
    "message": "Operation completed successfully",
    "data": { /* response data */ },
    "meta": { /* pagination, counts, etc */ }
}
```

### Error Response
```json
{
    "error": "Error description",
    "details": "Additional error details (optional)",
    "code": "ERROR_CODE (optional)"
}
```

## Authentication Flow

### 1. Registration & Login
```
POST /api/register → User created
POST /api/login → JWT token received
```

### 2. Using Protected Endpoints
```
Authorization: Bearer <jwt_token>
↓
Middleware validates token
↓ 
Sets x-user-id and x-user-email headers
↓
Endpoint receives authenticated request
```

### 3. Ownership Validation
```
User ID from JWT token
↓
Compare with resource owner ID  
↓
Allow/Deny access based on ownership
```

## API Workflow Examples

### Content Creator Workflow
1. `POST /api/register` - Register account
2. `POST /api/login` - Get JWT token
3. `POST /api/categories` - Create category (if needed)
4. `POST /api/packages` - Create package
5. `POST /api/packages/{id}/process` - Process with AI
6. `POST /api/questions` - Create questions from content
7. `POST /api/packages/{id}/publish` - Publish package

### Student Workflow  
1. `POST /api/register` - Register account
2. `POST /api/login` - Get JWT token
3. `GET /api/packages` - Browse packages
4. `POST /api/payments` - Purchase package
5. `GET /api/questions` - View questions
6. `POST /api/user-answers` - Submit answers
7. `POST /api/results` - Generate result
8. `GET /api/results` - View performance

### Admin/Testing Workflow
1. `GET /api/categories` - Review categories
2. `GET /api/profiles/{id}` - Check creator profiles
3. `POST /api/test-ai` - Test AI processing
4. `GET /api/packages` - Monitor published content

## Error Handling Patterns

### Client Errors (4xx)
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Access denied (insufficient permissions)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists

### Server Errors (5xx)
- `500 Internal Server Error` - Server-side error
- `503 Service Unavailable` - External service failure

## Rate Limiting

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 1 hour |
| File Upload | 10 requests | 1 hour |
| AI Processing | 5 requests | 1 hour |

## Performance Metrics

| Operation Type | Expected Response Time |
|---------------|----------------------|
| Database Reads | < 100ms |
| Database Writes | < 200ms |
| File Processing | < 5 seconds |
| AI Processing | < 30 seconds |
| Payment Gateway | < 10 seconds |

This comprehensive endpoint reference provides a complete overview of the Testoria API architecture, including all endpoints, authentication patterns, middleware rules, and usage workflows.
