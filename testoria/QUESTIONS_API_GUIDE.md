# Questions API Documentation

## Base URL
```
http://localhost:3000/api/questions
```

## Authentication
- POST endpoints require authentication (JWT token from login)
- GET endpoints are public (for users who purchased packages)

## Endpoints

### 1. CREATE QUESTIONS FROM PACKAGE CONTENT (POST)

#### Endpoint
```
POST /api/questions
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

**Note**: This endpoint automatically extracts questions from the package's AI-processed content. You only need to provide the packageId. The `images` array will always be empty by default - it's intended for manual image additions to questions later.

#### Expected Response (Success - 200)
```json
{
    "message": "5 questions created successfully from package content",
    "questionsCreated": 5,
    "packageId": "674b5678901234abcdef5678",
    "summary": {
        "totalQuestions": 5,
        "packageId": "674b5678901234abcdef5678", 
        "createdAt": "2024-12-01T10:30:00.000Z"
    },
    "questions": [
        {
            "number": 1,
            "questionId": "674d1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5678",
            "questionText": "What should the student do about the calculus problems?",
            "optionA": "Spend more time working on calculus problems.",
            "optionB": "Talk to an advisor about dropping the course.",
            "optionC": "Work on the assignment with a classmate.",
            "optionD": "Ask the graduate assistant for help.",
            "optionE": "",
            "correctAnswer": "C",
            "explanation": "Working with a classmate can provide additional support and understanding.",
            "images": [],
            "pageNumber": 1,
            "sourceQuestionId": "page_1_q_1"
        },
        {
            "number": 2,
            "questionId": "674d1234567890abcdef1235",
            "packageId": "674b5678901234abcdef5678",
            "questionText": "What should the person do about the book?",
            "optionA": "Go home to get a book.",
            "optionB": "Return a book to the library.",
            "optionC": "Pick up a book at the library for the woman.",
            "optionD": "Ask the librarian for help in finding a book.",
            "optionE": "",
            "correctAnswer": "D",
            "explanation": "Asking the librarian for help is a direct way to find the needed book.",
            "images": [],
            "pageNumber": 1,
            "sourceQuestionId": "page_1_q_2"
        }
    ]
}
```

#### Expected Response (Error - 401)
```json
{
    "error": "Authentication required"
}
```

#### Expected Response (Error - 403)
```json
{
    "error": "Unauthorized: You can only create questions for your own packages"
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "Package has no content. Please process the package with AI first."
}
```

#### Expected Response (Error - 404)
```json
{
    "error": "Package not found"
}
```

---

### 2. GET QUESTIONS BY PACKAGE (GET)

#### Endpoint
```
GET /api/questions?packageId={packageId}
```

#### Headers
```
Content-Type: application/json
```

#### Query Parameters
- `packageId` (required): ObjectId of the package

#### Example URL
```
GET /api/questions?packageId=674b5678901234abcdef5678
```

#### Expected Response (Success - 200)
```json
{
    "questions": [
        {
            "_id": "674d1234567890abcdef1234",
            "packageId": "674b5678901234abcdef5678",
            "questionText": "What is the capital of Indonesia?",
            "optionA": "Jakarta",
            "optionB": "Surabaya",
            "optionC": "Bandung", 
            "optionD": "Medan",
            "optionE": "Yogyakarta",
            "correctAnswer": "A",
            "explanation": "Jakarta is the capital and largest city of Indonesia.",
            "images": [],
            "createdAt": "2024-12-01T10:30:00.000Z"
        }
    ],
    "count": 1
}
```

#### Expected Response (Error - 400)
```json
{
    "error": "Package ID is required"
}
```

---

## 3. MANUAL QUESTION MANAGEMENT

### Create Single Question Manually (POST)

#### Endpoint
```
POST /api/questions/manual
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
    "questionText": "What is the capital of Indonesia?",
    "optionA": "Jakarta",
    "optionB": "Surabaya", 
    "optionC": "Bandung",
    "optionD": "Medan",
    "optionE": "Yogyakarta",
    "correctAnswer": "A",
    "explanation": "Jakarta is the capital and largest city of Indonesia.",
    "images": []
}
```

#### Expected Response (Success - 200)
```json
{
    "message": "Question created successfully",
    "questionId": "674d1234567890abcdef1234"
}
```

### Update Question (PUT)

#### Endpoint
```
PUT /api/questions/manual
```

#### Request Body (JSON)
```json
{
    "questionId": "674d1234567890abcdef1234",
    "questionText": "Updated question text?",
    "optionA": "Updated Option A",
    "correctAnswer": "B"
}
```

### Delete Question (DELETE)

#### Endpoint
```
DELETE /api/questions/manual?questionId=674d1234567890abcdef1234
```

---

## Database Schema

### Questions Table Structure
```sql
Table questions {
  _id ObjectId [pk]
  packageId ObjectId [ref: > packages._id]
  questionText string
  optionA string
  optionB string
  optionC string
  optionD string
  optionE string
  correctAnswer string // A–E
  explanation string
  images string[] // array of image URLs
  createdAt string // ISO timestamp
  updatedAt string // ISO timestamp (optional)
}
```

### Example Database Document
```json
{
    "_id": "674d1234567890abcdef1234",
    "packageId": "674b5678901234abcdef5678",
    "questionText": "What should the student do about the calculus problems?",
    "optionA": "Spend more time working on calculus problems.",
    "optionB": "Talk to an advisor about dropping the course.",
    "optionC": "Work on the assignment with a classmate.",
    "optionD": "Ask the graduate assistant for help.",
    "optionE": "",
    "correctAnswer": "C",
    "explanation": "Working with a classmate can provide additional support and understanding.",
    "images": [],
    "createdAt": "2024-12-01T10:30:00.000Z"
}
```

---

## Testing Scenarios

### Scenario 1: Create Questions from Package Content
1. **Login**: Get JWT token from login
2. **Create Package**: Create a package with PDF content
3. **Process Package**: Use AI processing to extract content from PDF
4. **Create Questions**: POST /api/questions with only packageId
5. **Verify Questions**: GET /api/questions?packageId={packageId}

### Scenario 2: Error Handling
1. **No Authorization**: POST without Authorization header
2. **Wrong User**: Try to create questions for someone else's package
3. **No Content**: Try to create questions from package without AI-processed content
4. **Invalid Package ID**: POST with non-existent packageId

### Scenario 3: Multiple Packages
1. **Create Multiple Packages**: Create several packages with different content
2. **Process All Packages**: Use AI processing on each package
3. **Create Questions**: POST /api/questions for each package
4. **Verify Separation**: Ensure questions are properly separated by package

---

## Question Model Methods

### Available Methods:
1. `create(question)` - Create new question
2. `findByPackageId(packageId)` - Get all questions for a package
3. `findById(id)` - Get question by ID
4. `updateById(id, updateData)` - Update question
5. `deleteById(id)` - Delete question
6. `countByPackageId(packageId)` - Count questions in package

### Usage Examples:

```javascript
// Create question
const questionId = await QuestionModel.create({
    packageId: "674b5678901234abcdef5678",
    questionText: "Sample question?",
    optionA: "Option A",
    optionB: "Option B", 
    optionC: "Option C",
    optionD: "Option D",
    optionE: "Option E",
    correctAnswer: "A",
    explanation: "Explanation here",
    images: []
});

// Get questions by package
const questions = await QuestionModel.findByPackageId("674b5678901234abcdef5678");

// Count questions
const count = await QuestionModel.countByPackageId("674b5678901234abcdef5678");
```

---

## Integration with Packages

Questions are automatically extracted from package content. Typical workflow:

1. **Create Package**: Use packages API to create package with PDF
2. **Process with AI**: Use AI processing to extract questions from PDF content
3. **Create Questions**: Use questions API with only packageId - questions are automatically extracted from package.contents
4. **Payment**: Users pay to access the package and its questions
5. **Access Questions**: Users can view questions after payment

### Package Content Structure Expected:

The API supports two content structures:

#### **Structure 1: Direct Questions (Current AI Processing Format)**
```json
{
  "contents": [
    {
      "questionText": "What should the student do about the calculus problems?",
      "options": {
        "A": "Spend more time working on calculus problems.",
        "B": "Talk to an advisor about dropping the course.",
        "C": "Work on the assignment with a classmate.",
        "D": "Ask the graduate assistant for help."
      },
      "correctAnswer": "C",
      "explanation": "Working with a classmate can provide additional support.",
      "pageNumber": 1,
      "questionId": "page_1_q_1",
      "imageUrl": "https://example.com/image.jpg"
    }
  ]
}
```

#### **Structure 2: Nested Questions (Alternative Format)**
```json
{
  "contents": [
    {
      "type": "question",
      "questions": [
        {
          "questionText": "Sample question?",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D",
            "E": "Option E"
          },
          "correctAnswer": "A",
          "explanation": "Explanation here",
          "imageUrl": "url_to_image"
        }
      ]
    }
  ]
}
```

### Authorization:
- Only the package creator (owner) can create questions from their package content
- The userId from the JWT token must match the package's creatorId

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

The Questions API is now fully integrated with the authentication middleware and follows the same patterns as the Payments API.
