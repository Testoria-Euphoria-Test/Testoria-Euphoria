# User Answers API Documentation

## Base URL
```
http://localhost:3000/api/user-answers
```

## Authentication
All endpoints require authentication (JWT token from login via middleware)

## Endpoints

### 1. SUBMIT USER ANSWERS (POST)

#### Endpoint
```
POST /api/user-answers
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer your_jwt_token_here
```

#### Request Body (JSON)
```json
{
    "packageId": "674b5678901234abcdef5678",
    "answers": [
        {
            "questionId": "674d1234567890abcdef1234",
            "selectedAnswer": "A"
        },
        {
            "questionId": "674d1234567890abcdef1235", 
            "selectedAnswer": "C"
        },
        {
            "questionId": "674d1234567890abcdef1236",
            "selectedAnswer": "B"
        }
    ]
}
```

#### Expected Response (Success - 200)
```json
{
    "message": "Answers submitted successfully",
    "submittedCount": 3,
    "submissionId": {
        "0": "674e1234567890abcdef1001",
        "1": "674e1234567890abcdef1002", 
        "2": "674e1234567890abcdef1003"
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
    "error": "Missing required fields: packageId and answers array"
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "Each answer must have questionId and selectedAnswer"
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "Question not found: 674d1234567890abcdef1234"
}
```

---

### 2. GET USER ANSWERS BY PACKAGE (GET)

#### Endpoint
```
GET /api/user-answers?packageId={packageId}
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer your_jwt_token_here
```

#### Query Parameters
- `packageId` (required): ObjectId of the package

#### Example URL
```
GET /api/user-answers?packageId=674b5678901234abcdef5678
```

#### Expected Response (Success - 200)
```json
{
    "userAnswers": [
        {
            "_id": "674e1234567890abcdef1001",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5678",
            "questionId": "674d1234567890abcdef1234",
            "selectedAnswer": "A",
            "isCorrect": true,
            "createdAt": "2024-12-01T10:30:00.000Z"
        },
        {
            "_id": "674e1234567890abcdef1002",
            "userId": "674a1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5678",
            "questionId": "674d1234567890abcdef1235",
            "selectedAnswer": "C",
            "isCorrect": false,
            "createdAt": "2024-12-01T10:30:00.000Z"
        }
    ],
    "count": 2,
    "packageId": "674b5678901234abcdef5678",
    "userId": "674a1234567890abcdef1234"
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "Package ID is required"
}
```

---

## Database Schema

### UserAnswers Table Structure
```sql
Table userAnswers {
  _id ObjectId [pk]
  userId ObjectId [ref: > users._id]
  packageId ObjectId [ref: > packages._id]
  questionId ObjectId [ref: > questions._id]
  selectedAnswer string // A–E
  isCorrect boolean
  createdAt string // ISO timestamp
}
```

### Example Database Document
```json
{
    "_id": "674e1234567890abcdef1001",
    "userId": "674a1234567890abcdef1234",
    "packageId": "674b5678901234abcdef5678",
    "questionId": "674d1234567890abcdef1234",
    "selectedAnswer": "A",
    "isCorrect": true,
    "createdAt": "2024-12-01T10:30:00.000Z"
}
```

---

## Testing Scenarios

### Scenario 1: Submit Quiz Answers
1. **Login**: Get JWT token from login
2. **Get Questions**: GET /api/questions?packageId={packageId}
3. **Answer Questions**: Prepare answers array with questionId and selectedAnswer
4. **Submit Answers**: POST /api/user-answers with packageId and answers
5. **Verify Submission**: GET /api/user-answers?packageId={packageId}

### Scenario 2: Error Handling
1. **No Authorization**: POST without Authorization header
2. **Missing Fields**: POST without packageId or answers
3. **Invalid Questions**: POST with non-existent questionId
4. **Malformed Answers**: POST with incomplete answer objects

### Scenario 3: Multiple Packages
1. **Take Multiple Quizzes**: Submit answers for different packages
2. **Verify Separation**: Ensure answers are properly separated by package
3. **Check User Progress**: GET answers for each package separately

---

## UserAnswer Model Methods

### Available Methods:
1. `submitMany(answers)` - Submit multiple answers at once
2. `findByUserAndPackage(userId, packageId)` - Get user answers for a package
3. `findById(id)` - Get answer by ID
4. `deleteByUserAndPackage(userId, packageId)` - Delete all user answers for a package
5. `getScoreByUserAndPackage(userId, packageId)` - Calculate user score for a package

### Usage Examples:

```javascript
// Submit answers
const result = await UserAnswerModel.submitMany([
    {
        userId: "674a1234567890abcdef1234",
        packageId: "674b5678901234abcdef5678",
        questionId: "674d1234567890abcdef1234",
        selectedAnswer: "A",
        isCorrect: true
    }
]);

// Get user answers
const answers = await UserAnswerModel.findByUserAndPackage(
    "674a1234567890abcdef1234", 
    "674b5678901234abcdef5678"
);

// Get user score
const score = await UserAnswerModel.getScoreByUserAndPackage(
    "674a1234567890abcdef1234",
    "674b5678901234abcdef5678"
);
// Returns: { totalQuestions: 5, correctAnswers: 4, incorrectAnswers: 1, score: 80, percentage: "80%" }
```

---

## Integration Workflow

Typical user quiz-taking workflow:

1. **User Purchases Package**: Payment processed via payments API
2. **User Views Questions**: GET /api/questions?packageId={packageId}
3. **User Answers Questions**: Collect answers in frontend
4. **User Submits Quiz**: POST /api/user-answers with all answers
5. **System Calculates Score**: Automatic scoring based on correct answers
6. **User Views Results**: GET /api/user-answers?packageId={packageId}
7. **Score Calculation**: Use getScoreByUserAndPackage() for detailed scoring

### Business Logic:
- Each question is automatically scored as correct/incorrect
- Users can only submit answers for packages they own/purchased
- Answers are timestamped for tracking submission time
- Multiple submissions for the same package are allowed (latest overwrites)

---

## Environment Variables

No additional environment variables required beyond the standard MongoDB and JWT settings.

---

## Error Handling

All endpoints include comprehensive error handling with:
- Proper HTTP status codes
- Descriptive error messages  
- Console logging for debugging
- Type-safe error responses
- Input validation for all fields

The User Answers API integrates seamlessly with the Questions and Payments APIs to provide a complete quiz-taking experience.
