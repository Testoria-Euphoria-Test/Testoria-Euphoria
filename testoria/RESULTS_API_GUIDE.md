# Results API Documentation

## Base URL
```
http://localhost:3000/api/results
```

## Authentication
All endpoints require authentication (JWT token from login via middleware)

## Endpoints

### 1. CREATE RESULT (POST)

#### Endpoint
```
POST /api/results
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer your_jwt_token_here
```

#### Request Body (JSON)
```json
{
    "packageId": "674b5678901234abcdef5678"
}
```

**Note**: The `durationTaken` is automatically filled from the package's duration field. No need to send it in the request.

#### Expected Response (Success - 200)
```json
{
    "message": "Result created successfully",
    "result": {
        "_id": "674f1234567890abcdef1001",
        "userId": "674a1234567890abcdef1234",
        "packageId": "674b5678901234abcdef5678",
        "score": 85,
        "totalCorrect": 17,
        "totalWrong": 3,
        "totalUnanswered": 0,
        "durationTaken": 60,
        "feedback": "Excellent work! You demonstrated strong understanding of the material. Your performance shows you've mastered most concepts. Consider reviewing the questions you missed to achieve perfect scores in future quizzes.",
        "createdAt": "2024-12-01T15:30:00.000Z",
        "packageTitle": "Advanced JavaScript Concepts"
    }
}
```

#### Expected Response (Error - 401)
```json
{
    "error": "Authentication required"
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "Missing required field: packageId"
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "No answers found. Please submit answers first."
}
```

#### Expected Response (Error - 404)
```json
{
    "error": "Package not found"
}
```

#### Expected Response (Error - 409)
```json
{
    "error": "Result already exists for this package",
    "existingResult": {
        "_id": "674f1234567890abcdef1001",
        "userId": "674a1234567890abcdef1234",
        "packageId": "674b5678901234abcdef5678",
        "score": 85,
        "totalCorrect": 17,
        "totalWrong": 3,
        "totalUnanswered": 0,
        "durationTaken": 60,
        "feedback": "Previous feedback...",
        "createdAt": "2024-12-01T15:30:00.000Z"
    }
}
```

---

### 2. GET RESULTS (GET)

#### Endpoint
```
GET /api/results
GET /api/results?packageId={packageId}
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer your_jwt_token_here
```

#### Query Parameters
- `packageId` (optional): ObjectId of specific package

#### Example URLs
```
GET /api/results (get all user results)
GET /api/results?packageId=674b5678901234abcdef5678 (get specific result)
```

#### Expected Response - All Results (Success - 200)
```json
{
    "results": [
        {
            "_id": "674f1234567890abcdef1001",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5678",
            "score": 85,
            "totalCorrect": 17,
            "totalWrong": 3,
            "totalUnanswered": 0,
            "durationTaken": 60,
            "feedback": "Excellent work! You demonstrated strong understanding...",
            "createdAt": "2024-12-01T15:30:00.000Z"
        },
        {
            "_id": "674f1234567890abcdef1002",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5679",
            "score": 72,
            "totalCorrect": 14,
            "totalWrong": 6,
            "totalUnanswered": 0,
            "durationTaken": 45,
            "feedback": "Good effort! Consider reviewing the topics you missed...",
            "createdAt": "2024-12-01T14:20:00.000Z"
        }
    ],
    "count": 2
}
```

#### Expected Response - Specific Result (Success - 200)
```json
{
    "results": [
        {
            "_id": "674f1234567890abcdef1001",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5678",
            "score": 85,
            "totalCorrect": 17,
            "totalWrong": 3,
            "totalUnanswered": 0,
            "durationTaken": 60,
            "feedback": "Excellent work! You demonstrated strong understanding...",
            "createdAt": "2024-12-01T15:30:00.000Z"
        }
    ],
    "count": 1
}
```

#### Expected Response (Error - 404)
```json
{
    "error": "No result found for this package"
}
```

---

## Database Schema

### Results Table Structure
```sql
Table results {
  _id ObjectId [pk]
  userId ObjectId [ref: > users._id]
  packageId ObjectId [ref: > packages._id]
  score number // 0-100 percentage
  totalCorrect number
  totalWrong number
  totalUnanswered number
  durationTaken number // minutes from package.duration
  feedback string // AI-generated feedback
  createdAt string // ISO timestamp
}
```

### Example Database Document
```json
{
    "_id": "674f1234567890abcdef1001",
    "userId": "674a1234567890abcdef1234",
    "packageId": "674b5678901234abcdef5678",
    "score": 85,
    "totalCorrect": 17,
    "totalWrong": 3,
    "totalUnanswered": 0,
    "durationTaken": 60,
    "feedback": "Excellent work! You demonstrated strong understanding of the material.",
    "createdAt": "2024-12-01T15:30:00.000Z"
}
```

---

## Testing Scenarios

### Scenario 1: Complete Quiz Workflow
1. **Login**: Get JWT token from login
2. **Take Quiz**: Submit answers via user-answers API
3. **Generate Result**: POST /api/results with packageId
4. **View Result**: GET /api/results?packageId={packageId}

### Scenario 2: Multiple Quiz Results
1. **Take Multiple Quizzes**: Submit answers for different packages
2. **Generate Results**: POST /api/results for each package
3. **View All Results**: GET /api/results (without packageId)
4. **View Specific Result**: GET /api/results?packageId={packageId}

### Scenario 3: Error Handling
1. **No Answers**: Try to create result without submitting answers first
2. **Duplicate Result**: Try to create result twice for same package
3. **Invalid Package**: POST with non-existent packageId
4. **No Authorization**: GET/POST without Authorization header

---

## Result Model Methods

### Available Methods:
1. `create(resultData)` - Create new result
2. `findByUser(userId)` - Get all results for a user
3. `findByUserAndPackage(userId, packageId)` - Get specific result
4. `findById(id)` - Get result by ID
5. `deleteById(id)` - Delete result

### Usage Examples:

```javascript
// Create result
const result = await ResultModel.create({
    userId: "674a1234567890abcdef1234",
    packageId: "674b5678901234abcdef5678",
    score: 85,
    totalCorrect: 17,
    totalWrong: 3,
    totalUnanswered: 0,
    durationTaken: 60,
    feedback: "Great job!"
});

// Get user results
const results = await ResultModel.findByUser("674a1234567890abcdef1234");

// Get specific result
const result = await ResultModel.findByUserAndPackage(
    "674a1234567890abcdef1234",
    "674b5678901234abcdef5678"
);
```

---

## AI Feedback Generation

The system uses OpenAI to generate personalized feedback based on:
- **Score percentage**: Overall performance level
- **Question analysis**: Specific topics missed
- **Answer patterns**: Areas for improvement
- **Motivational tone**: Encouraging and constructive

### Feedback Categories:
- **Excellent (80-100%)**: Congratulatory with minor improvement suggestions
- **Good (60-79%)**: Positive with specific review recommendations  
- **Needs Improvement (<60%)**: Encouraging with study guidance

### Fallback System:
If AI feedback generation fails, the system provides fallback feedback based on score ranges to ensure users always receive meaningful responses.

---

## Integration Workflow

Complete user quiz experience:

1. **User Purchases Package**: Via payments API
2. **User Takes Quiz**: Via questions and user-answers APIs
3. **System Generates Result**: Via results API (with AI feedback)
4. **User Views Performance**: Complete score breakdown and personalized feedback
5. **Progress Tracking**: Historical results for learning analytics

### Business Logic:
- One result per user per package (prevents duplicate results)
- Duration automatically filled from package settings
- AI-generated personalized feedback
- Complete scoring analytics
- Historical performance tracking

---

## Environment Variables

Required environment variables:
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Error Handling

All endpoints include comprehensive error handling with:
- Proper HTTP status codes
- Descriptive error messages
- Console logging for debugging
- Type-safe error responses
- AI fallback mechanisms
- Input validation for all fields

The Results API completes the quiz-taking workflow by providing comprehensive result analysis with AI-powered feedback.
