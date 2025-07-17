# 📚 Testoria - AI-Powered Online Exam Platform

## 📖 Brief Description

**Testoria** is a web-based online exam platform specifically designed for Indonesian students preparing for UTBK, CPNS, SNBT, and Kedinasan examinations. Built with cutting-edge AI technology, this platform offers automated content generation, intelligent feedback, and seamless learning experience with secure payment integration.

### 🎯 Key Features

- **🤖 AI Question Generation** - Automatically converts PDF to exam questions
- **👥 Multi-Role System** - Supports Customer, Creator, and Admin roles
- **💳 Secure Payment** - Integration with Midtrans
- **📊 Intelligent Analytics** - Deep AI-powered feedback

## ✨ Main Features

### 🎯 Core Features

- **🤖 AI Content Generation** - Automatically converts PDF documents into exam questions using OpenAI
- **👥 Multi-Role System** - Supports Customer, Creator, and Admin with different functions
- **⏱️ Automated Assessment Engine** - Real-time exam engine with timer and auto-save
- **💳 Payment Integration** - Secure payment processing through Midtrans gateway
- **📊 Intelligent Analytics** - AI feedback and in-depth result analysis
- **🔐 JWT Authentication** - Secure token-based authentication system

### 👤 Customer Features

- Browse and filter exam packages by category, price, and rating
- Secure payment process with various payment methods
- Take timed exams with real-time auto-save functionality
- View comprehensive results with personalized AI feedback
- Track learning progress and performance analysis

### ✍️ Creator Features

- Upload PDF documents with automatic AI question extraction
- Manage exam packages and content with intuitive interface
- Track revenue and sales analytics
- Monitor package performance and user engagement

### 🔧 Admin Features

- Complete user management and role assignment
- Content moderation and package oversight
- Category management for exam types
- Platform-wide analytics and reporting

## 🛠️ Technology Stack

### **Frontend**

- **Next.js 15.3.4** - React framework with App Router
- **React 19.0.0** - UI library with modern hooks
- **TypeScript** - JavaScript with type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### **Backend**

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **JWT (jsonwebtoken + jose)** - Authentication & authorization
- **bcryptjs** - Password hashing

### **AI & Machine Learning**

- **OpenAI API** - Question generation and AI feedback
- **Custom AI Processing** - PDF content extraction and analysis
- **Automated Feedback System** - Personalized performance insights

### **Payment & File Management**

- **Midtrans** - Indonesian payment gateway
- **Cloudinary** - Cloud storage for images and PDF
- **PDF Processing** - PDF parsing and content extraction

## 🚀 Installation & How to Run

### **Prerequisites**

- Node.js 18.x or newer
- MongoDB database
- OpenAI API key
- Midtrans account
- Cloudinary account

### **1. Clone Repository**

```bash
git clone https://github.com/yourusername/Testoria-Euphoria.git
cd Testoria-Euphoria/testoria
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Setup Environment Variables**

Create `.env.local` file in root folder:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/testoria

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Midtrans
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **4. Run Application**

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### **5. Access Application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 User Roles & Capabilities

### 👤 Customer Experience

- **📚 Package Discovery** - Browse comprehensive exam packages with advanced filtering
- **🔍 Smart Search** - Filter by category, price range, difficulty level, and ratings
- **💳 Secure Payments** - Multiple payment methods via Midtrans gateway
- **⏱️ Timed Assessments** - Take exams with countdown timer and auto-save functionality
- **📊 Detailed Results** - Comprehensive performance analysis with AI-powered feedback
- **📈 Progress Tracking** - Monitor learning journey and improvement metrics

### ✍️ Creator Dashboard

- **📄 PDF Processing** - Upload documents with automatic AI question extraction
- **🤖 AI Content Generation** - Generate diverse question types with intelligent algorithms
- **📦 Package Management** - Create, edit, and organize exam packages
- **💰 Revenue Analytics** - Track earnings, sales trends, and financial performance
- **📊 Performance Insights** - Monitor package popularity and user engagement

### 🔧 Admin Control Panel

- **👥 User Administration** - Complete user management with role assignments
- **📦 Content Moderation** - Review and approve creator-generated content
- **🏷️ Category Management** - Organize and maintain exam categories
- **📊 Platform Analytics** - Comprehensive system-wide reporting and insights

## 📸 Video Demo

https://drive.google.com/file/d/1m0qBjIy0AWqRciWQrChOyBgUAmaGfpMJ/view?usp=sharin

## 🤝 Contributing

We welcome contributions to Testoria! Please follow these steps:

### **How to Contribute**

1. **Fork Repository**

   ```bash
   git clone https://github.com/yourusername/Testoria-Euphoria.git
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**

   - Follow existing code style
   - Add tests for new features
   - Update documentation if needed

4. **Commit Changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to Branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**






