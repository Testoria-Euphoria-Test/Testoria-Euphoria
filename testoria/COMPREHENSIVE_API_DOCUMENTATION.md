# Testoria API Documentation v1.0

## Base URL
```
http://localhost:3000/api
```

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Standard Headers](#standard-headers)
3. [Error Responses](#error-responses)
4. [Authentication Endpoints](#authentication-endpoints)
5. [User Management](#user-management)
6. [Profile Management](#profile-management)
7. [Category Management](#category-management)
8. [Package Management](#package-management)
9. [Payment Management](#payment-management)
10. [Question Management](#question-management)
11. [User Answers](#user-answers)
12. [Results & Analytics](#results--analytics)
13. [AI Integration](#ai-integration)

---

## Authentication & Authorization

### Middleware Rules
The system uses JWT-based authentication with the following access levels:

| Access Level | Description | Authentication Required |
|--------------|-------------|------------------------|
| **Public** | No authentication required | ❌ |
| **Protected** | JWT token required | ✅ |
| **Owner** | User can only access their own resources | ✅ |

### Middleware Configuration
```typescript
// Protected endpoints matching patterns:
'/api/users/:path*'
'/api/categories/:path*' 
'/api/profiles/:path*'
'/api/packages/:path*'
'/api/payments/:path*'
'/api/questions/:path*'
'/api/user-answers/:path*'
'/api/results/:path*'
'/api/test-ai/:path*'
```

### Public Endpoints (No Auth Required)
- `GET /api/packages` - Browse published packages
- `GET /api/packages/{id}` - View published package details
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/{id}` - View category
- `GET /api/profiles/{id}` - View creator profile (not /me)
- `GET /api/questions` - View questions (for purchased packages)
- `POST /api/payments/notify` - Midtrans webhook
- `POST /api/test-ai` - AI testing (development)

---

## Standard Headers

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>  # Required for protected endpoints
```

### Response Headers
```http
Content-Type: application/json
```

### Middleware Injected Headers (Internal)
```http
x-user-id: <user_object_id>     # Injected by middleware
x-user-email: <user_email>      # Injected by middleware
```

---

## Error Responses

### Standard Error Format
```json
{
    "error": "Error message description",
    "details": "Additional error details (optional)",
    "code": "ERROR_CODE (optional)"
}
```

### HTTP Status Codes
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful operation |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Access denied (insufficient permissions) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server-side error |

---

## Authentication Endpoints

### Register User
**POST** `/api/register`

**Access Level:** Public

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
}
```

**Response (201):**
```json
{
    "_id": "674a1234567890abcdef1234",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-12-01T10:30:00.000Z"
}
```

**Errors:**
- `400` - Invalid input data
- `409` - Email already exists

---

### Login User
**POST** `/api/login`

**Access Level:** Public

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
    "message": "Login successful",
    "user": {
        "_id": "674a1234567890abcdef1234",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Invalid input format
- `401` - Invalid email or password

---

## User Management

### Get User by ID
**GET** `/api/users/{id}`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "_id": "674a1234567890abcdef1234",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-12-01T10:30:00.000Z"
}
```

**Errors:**
- `401` - Authentication required
- `403` - Access denied (not owner)
- `404` - User not found

---

### Update User
**PUT** `/api/users/{id}`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "username": "john_doe_updated"
}
```

**Response (200):**
```json
{
    "message": "User updated successfully",
    "user": {
        "_id": "674a1234567890abcdef1234",
        "username": "john_doe_updated",
        "email": "john@example.com",
        "firstName": "John Updated",
        "lastName": "Doe Updated",
        "updatedAt": "2024-12-01T11:30:00.000Z"
    }
}
```

---

## Profile Management

### Get My Profile
**GET** `/api/profiles/me`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "_id": "674a1234567890abcdef1234",
    "userId": "674a1234567890abcdef1234",
    "displayName": "John Doe",
    "bio": "Software Developer",
    "avatar": "https://example.com/avatar.jpg",
    "socialLinks": {
        "website": "https://johndoe.com",
        "twitter": "@johndoe",
        "linkedin": "johndoe"
    },
    "createdAt": "2024-12-01T10:30:00.000Z"
}
```

---

### Update My Profile
**PUT** `/api/profiles/me`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "displayName": "John Doe Updated",
    "bio": "Senior Software Developer",
    "avatar": "https://example.com/new-avatar.jpg",
    "socialLinks": {
        "website": "https://johndoe-new.com",
        "twitter": "@johndoe_new"
    }
}
```

**Response (200):**
```json
{
    "message": "Profile updated successfully",
    "profile": {
        "_id": "674a1234567890abcdef1234",
        "displayName": "John Doe Updated",
        "bio": "Senior Software Developer",
        "updatedAt": "2024-12-01T11:30:00.000Z"
    }
}
```

---

### Get Public Profile
**GET** `/api/profiles/{id}`

**Access Level:** Public

**Response (200):**
```json
{
    "_id": "674a1234567890abcdef1234",
    "displayName": "John Doe",
    "bio": "Software Developer",
    "avatar": "https://example.com/avatar.jpg",
    "socialLinks": {
        "website": "https://johndoe.com"
    },
    "totalPackages": 5,
    "totalStudents": 150,
    "rating": 4.8
}
```

---

## Category Management

### List Categories
**GET** `/api/categories`

**Access Level:** Public

**Response (200):**
```json
{
    "categories": [
        {
            "_id": "674b1234567890abcdef1234",
            "name": "Programming",
            "description": "Programming and software development",
            "icon": "💻",
            "packageCount": 25,
            "createdAt": "2024-12-01T10:30:00.000Z"
        }
    ],
    "count": 1
}
```

---

### Create Category
**POST** `/api/categories`

**Access Level:** Public

**Request Body:**
```json
{
    "name": "Data Science",
    "description": "Data science and machine learning",
    "icon": "📊"
}
```

**Response (201):**
```json
{
    "message": "Category created successfully",
    "categoryId": "674b1234567890abcdef1235"
}
```

---

### Get Category
**GET** `/api/categories/{id}`

**Access Level:** Public

**Response (200):**
```json
{
    "_id": "674b1234567890abcdef1234",
    "name": "Programming",
    "description": "Programming and software development",
    "icon": "💻",
    "packages": [
        {
            "_id": "674c1234567890abcdef1234",
            "title": "JavaScript Fundamentals",
            "price": 50000,
            "creatorName": "John Doe"
        }
    ],
    "packageCount": 1
}
```

---

## Package Management

### List Published Packages
**GET** `/api/packages`

**Access Level:** Public

**Query Parameters:**
- `category` (optional) - Filter by category ID
- `search` (optional) - Search in title/description
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Example URL:**
```
GET /api/packages?category=674b1234567890abcdef1234&search=javascript&page=1&limit=10
```

**Response (200):**
```json
{
    "packages": [
        {
            "_id": "674c1234567890abcdef1234",
            "title": "JavaScript Fundamentals",
            "description": "Learn JavaScript from basics to advanced",
            "price": 50000,
            "duration": 60,
            "categoryId": "674b1234567890abcdef1234",
            "categoryName": "Programming",
            "creatorId": "674a1234567890abcdef1234",
            "creatorName": "John Doe",
            "isPublished": true,
            "createdAt": "2024-12-01T10:30:00.000Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "itemsPerPage": 10
    }
}
```

---

### Get Package Details
**GET** `/api/packages/{id}`

**Access Level:** Public

**Response (200):**
```json
{
    "_id": "674c1234567890abcdef1234",
    "title": "JavaScript Fundamentals",
    "description": "Learn JavaScript from basics to advanced",
    "sourcePdf": "https://storage.com/js-fundamentals.pdf",
    "pdfImages": ["https://storage.com/page1.jpg"],
    "contents": [
        {
            "questionText": "What is JavaScript?",
            "options": {
                "A": "A programming language",
                "B": "A markup language",
                "C": "A database",
                "D": "A framework"
            },
            "correctAnswer": "A",
            "explanation": "JavaScript is a programming language"
        }
    ],
    "price": 50000,
    "duration": 60,
    "categoryId": "674b1234567890abcdef1234",
    "categoryName": "Programming",
    "creatorId": "674a1234567890abcdef1234",
    "creatorName": "John Doe",
    "creatorProfile": {
        "displayName": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
    },
    "totalQuestions": 25,
    "isPublished": true,
    "createdAt": "2024-12-01T10:30:00.000Z"
}
```

---

### Create Package
**POST** `/api/packages`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "title": "React Advanced Concepts",
    "description": "Master advanced React patterns",
    "sourcePdf": "https://storage.com/react-advanced.pdf",
    "categoryId": "674b1234567890abcdef1234",
    "duration": 90,
    "price": 75000
}
```

**Response (201):**
```json
{
    "message": "Package created successfully",
    "packageId": "674c1234567890abcdef1235",
    "package": {
        "_id": "674c1234567890abcdef1235",
        "title": "React Advanced Concepts",
        "isPublished": false,
        "createdAt": "2024-12-01T11:30:00.000Z"
    }
}
```

---

### Get My Packages
**GET** `/api/packages/my-packages`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: `draft`, `published`

**Response (200):**
```json
{
    "packages": [
        {
            "_id": "674c1234567890abcdef1234",
            "title": "JavaScript Fundamentals",
            "description": "Learn JavaScript basics",
            "isPublished": true,
            "totalQuestions": 25,
            "totalStudents": 45,
            "revenue": 2250000,
            "createdAt": "2024-12-01T10:30:00.000Z"
        }
    ],
    "stats": {
        "totalPackages": 3,
        "publishedPackages": 2,
        "draftPackages": 1,
        "totalRevenue": 5000000,
        "totalStudents": 120
    }
}
```

---

### Update Package
**PUT** `/api/packages/{id}`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "title": "JavaScript Fundamentals Updated",
    "description": "Updated description",
    "price": 60000
}
```

**Response (200):**
```json
{
    "message": "Package updated successfully",
    "package": {
        "_id": "674c1234567890abcdef1234",
        "title": "JavaScript Fundamentals Updated",
        "updatedAt": "2024-12-01T11:30:00.000Z"
    }
}
```

---

### Process Package with AI
**POST** `/api/packages/{id}/process`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "message": "Package processed successfully with AI",
    "questionsExtracted": 25,
    "processingTime": "45 seconds",
    "contents": [
        {
            "questionText": "What is a variable in JavaScript?",
            "options": {
                "A": "A container for data",
                "B": "A function",
                "C": "A loop",
                "D": "An object"
            },
            "correctAnswer": "A",
            "explanation": "Variables are containers for storing data values"
        }
    ]
}
```

---

### Publish Package
**POST** `/api/packages/{id}/publish`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "message": "Package published successfully",
    "package": {
        "_id": "674c1234567890abcdef1234",
        "title": "JavaScript Fundamentals",
        "isPublished": true,
        "publishedAt": "2024-12-01T11:30:00.000Z"
    }
}
```

---

### Reupload Package PDF
**POST** `/api/packages/{id}/reupload`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "sourcePdf": "https://storage.com/new-file.pdf"
}
```

**Response (200):**
```json
{
    "message": "PDF reuploaded successfully",
    "package": {
        "_id": "674c1234567890abcdef1234",
        "sourcePdf": "https://storage.com/new-file.pdf",
        "updatedAt": "2024-12-01T11:30:00.000Z"
    }
}
```

---

## Payment Management

### Create Payment
**POST** `/api/payments`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "packageId": "674c1234567890abcdef1234"
}
```

**Response (200):**
```json
{
    "message": "Payment created successfully",
    "payment": {
        "_id": "674d1234567890abcdef1234",
        "userId": "674a1234567890abcdef1234",
        "packageId": "674c1234567890abcdef1234",
        "amount": 50000,
        "status": "pending",
        "paymentMethod": "midtrans",
        "transactionId": "TXN-1234567890",
        "createdAt": "2024-12-01T11:30:00.000Z"
    },
    "midtransToken": "abc123-def456-ghi789",
    "redirectUrl": "https://app.midtrans.com/snap/v1/transactions/abc123"
}
```

---

### Get Payment Details
**GET** `/api/payments/{id}`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "_id": "674d1234567890abcdef1234",
    "userId": "674a1234567890abcdef1234",
    "packageId": "674c1234567890abcdef1234",
    "packageTitle": "JavaScript Fundamentals",
    "amount": 50000,
    "status": "paid",
    "paymentMethod": "midtrans",
    "transactionId": "TXN-1234567890",
    "paidAt": "2024-12-01T11:35:00.000Z",
    "createdAt": "2024-12-01T11:30:00.000Z"
}
```

---

### Midtrans Webhook
**POST** `/api/payments/notify`

**Access Level:** Public (Webhook)

**Headers:**
```http
Content-Type: application/json
X-Callback-Token: <midtrans_signature>
```

**Request Body (from Midtrans):**
```json
{
    "transaction_status": "settlement",
    "order_id": "674d1234567890abcdef1234",
    "gross_amount": "50000.00",
    "payment_type": "credit_card",
    "transaction_time": "2024-12-01 11:35:00",
    "signature_key": "abc123def456..."
}
```

**Response (200):**
```json
{
    "message": "Payment notification processed successfully",
    "paymentId": "674d1234567890abcdef1234",
    "status": "paid"
}
```

---

## Question Management

### Create Questions from Package
**POST** `/api/questions`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "packageId": "674c1234567890abcdef1234"
}
```

**Response (200):**
```json
{
    "message": "25 questions created successfully from package content",
    "questionsCreated": 25,
    "packageId": "674c1234567890abcdef1234",
    "summary": {
        "totalQuestions": 25,
        "packageId": "674c1234567890abcdef1234",
        "createdAt": "2024-12-01T11:30:00.000Z"
    },
    "questions": [
        {
            "number": 1,
            "questionId": "674e1234567890abcdef1234",
            "packageId": "674c1234567890abcdef1234",
            "questionText": "What is JavaScript?",
            "optionA": "A programming language",
            "optionB": "A markup language",
            "optionC": "A database",
            "optionD": "A framework",
            "optionE": "",
            "correctAnswer": "A",
            "explanation": "JavaScript is a programming language",
            "images": [],
            "pageNumber": 1,
            "sourceQuestionId": "page_1_q_1"
        }
    ]
}
```

---

### Get Questions by Package
**GET** `/api/questions?packageId={packageId}`

**Access Level:** Public (for purchased packages)

**Query Parameters:**
- `packageId` (required) - Package ID

**Response (200):**
```json
{
    "questions": [
        {
            "_id": "674e1234567890abcdef1234",
            "packageId": "674c1234567890abcdef1234",
            "questionText": "What is JavaScript?",
            "optionA": "A programming language",
            "optionB": "A markup language",
            "optionC": "A database",
            "optionD": "A framework",
            "optionE": "",
            "correctAnswer": "A",
            "explanation": "JavaScript is a programming language",
            "images": [],
            "createdAt": "2024-12-01T11:30:00.000Z"
        }
    ],
    "count": 25
}
```

---

### Create Question Manually
**POST** `/api/questions/manual`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "packageId": "674c1234567890abcdef1234",
    "questionText": "What is a closure in JavaScript?",
    "optionA": "A function inside another function",
    "optionB": "A variable declaration",
    "optionC": "A loop structure",
    "optionD": "An object method",
    "optionE": "",
    "correctAnswer": "A",
    "explanation": "A closure is a function that has access to outer function variables",
    "images": []
}
```

**Response (200):**
```json
{
    "message": "Question created successfully",
    "questionId": "674e1234567890abcdef1235"
}
```

---

### Update Question
**PUT** `/api/questions/manual`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "questionId": "674e1234567890abcdef1234",
    "questionText": "What is a closure in JavaScript? (Updated)",
    "optionA": "Updated option A",
    "correctAnswer": "B"
}
```

**Response (200):**
```json
{
    "message": "Question updated successfully",
    "questionId": "674e1234567890abcdef1234"
}
```

---

### Delete Question
**DELETE** `/api/questions/manual?questionId={questionId}`

**Access Level:** Protected (Owner only)

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "message": "Question deleted successfully",
    "questionId": "674e1234567890abcdef1234"
}
```

---

## User Answers

### Submit Quiz Answers
**POST** `/api/user-answers`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "packageId": "674c1234567890abcdef1234",
    "answers": [
        {
            "questionId": "674e1234567890abcdef1234",
            "selectedAnswer": "A"
        },
        {
            "questionId": "674e1234567890abcdef1235",
            "selectedAnswer": "C"
        }
    ]
}
```

**Response (200):**
```json
{
    "message": "Answers submitted successfully",
    "submittedCount": 2,
    "submissionId": {
        "0": "674f1234567890abcdef1001",
        "1": "674f1234567890abcdef1002"
    }
}
```

---

### Get User Answers
**GET** `/api/user-answers?packageId={packageId}`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `packageId` (required) - Package ID

**Response (200):**
```json
{
    "userAnswers": [
        {
            "_id": "674f1234567890abcdef1001",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674c1234567890abcdef1234",
            "questionId": "674e1234567890abcdef1234",
            "selectedAnswer": "A",
            "isCorrect": true,
            "createdAt": "2024-12-01T12:00:00.000Z"
        }
    ],
    "count": 2,
    "packageId": "674c1234567890abcdef1234",
    "userId": "674a1234567890abcdef1234"
}
```

---

## Results & Analytics

### Generate Quiz Result
**POST** `/api/results`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "packageId": "674c1234567890abcdef1234"
}
```

**Note:** Duration is automatically filled from package settings.

**Response (200):**
```json
{
    "message": "Result created successfully",
    "result": {
        "_id": "674g1234567890abcdef1001",
        "userId": "674a1234567890abcdef1234",
        "packageId": "674c1234567890abcdef1234",
        "score": 85,
        "totalCorrect": 17,
        "totalWrong": 3,
        "totalUnanswered": 5,
        "durationTaken": 60,
        "feedback": "Excellent work! You demonstrated strong understanding of the material. Your performance shows you've mastered most concepts. Consider reviewing the questions you missed to achieve perfect scores in future quizzes.",
        "createdAt": "2024-12-01T12:30:00.000Z",
        "packageTitle": "JavaScript Fundamentals"
    }
}
```

---

### Get Results
**GET** `/api/results`
**GET** `/api/results?packageId={packageId}`

**Access Level:** Protected

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `packageId` (optional) - Get specific result

**Response - All Results (200):**
```json
{
    "results": [
        {
            "_id": "674g1234567890abcdef1001",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674c1234567890abcdef1234",
            "score": 85,
            "totalCorrect": 17,
            "totalWrong": 3,
            "totalUnanswered": 5,
            "durationTaken": 60,
            "feedback": "Excellent work! You demonstrated strong understanding...",
            "createdAt": "2024-12-01T12:30:00.000Z"
        }
    ],
    "count": 1
}
```

---

## AI Integration

### Test AI Processing
**POST** `/api/test-ai`

**Access Level:** Public (Development)

**Request Body:**
```json
{
    "content": "Sample PDF content to process",
    "type": "question_extraction"
}
```

**Response (200):**
```json
{
    "message": "AI processing completed",
    "extractedQuestions": [
        {
            "questionText": "What is the main topic?",
            "options": {
                "A": "Option A",
                "B": "Option B",
                "C": "Option C",
                "D": "Option D"
            },
            "correctAnswer": "A",
            "explanation": "Explanation here"
        }
    ],
    "processingTime": "2.5 seconds"
}
```

---

## Rate Limiting & Performance

### Rate Limits
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| API Calls | 100 requests | 1 hour |
| File Uploads | 10 requests | 1 hour |
| AI Processing | 5 requests | 1 hour |

### Response Times
- Database queries: < 100ms
- File processing: < 5s
- AI processing: < 30s

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/testoria

# JWT
JWT_SECRET=your_jwt_secret_key

# Midtrans
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## Testing & Examples

### Postman Collection
A comprehensive Postman collection is available with:
- Pre-configured environments
- Authentication workflows
- Complete API examples
- Test scripts for validation

### Testing Workflow
1. **Authentication**: Register → Login → Get token
2. **Content Creation**: Create category → Create package → Process with AI
3. **Publishing**: Create questions → Publish package
4. **User Experience**: Browse packages → Purchase → Take quiz → View results
5. **Analytics**: View user answers → Generate results → AI feedback

---

## Support & Documentation

### Additional Resources
- [Payment API Guide](./POSTMAN_PAYMENT_API_GUIDE.md)
- [Questions API Guide](./QUESTIONS_API_GUIDE.md)
- [User Answers API Guide](./USER_ANSWERS_API_GUIDE.md)
- [Results API Guide](./RESULTS_API_GUIDE.md)

### Contact
- **API Version**: 1.0
- **Last Updated**: December 2024
- **Support**: Contact development team for issues

---

*This documentation covers all available endpoints in the Testoria API. Each endpoint includes comprehensive examples, error handling, and integration guidelines for seamless development.*
