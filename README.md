# ProSocial Backend

A LinkedIn-style social media backend built with Node.js, Express, and MongoDB. This RESTful API provides authentication, user profiles, and post management functionalities for a professional social networking platform.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with bcrypt password hashing
- **User Management**: Signup, login, logout, and profile management
- **Post System**: Create, read, and manage posts with author information
- **Profile System**: User profiles with about sections and public profile access
- **Security**: Protected routes with JWT middleware and secure cookie handling
- **CORS Enabled**: Cross-origin resource sharing support

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Environment Variables**: dotenv

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── post.controllers.js
│   └── user.controllers.js
├── middlewares/
│   └── auth.middlewares.js
├── models/
│   ├── post.models.js
│   └── user.models.js
├── routes/
│   ├── post.routes.js
│   └── user.routes.js
├── utils/
│   └── auth.utils.js
├── db/
│   └── connectDB.js
├── constants.js
└── server.js
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017
   JWT_SECRET=your_jwt_secret_key_here
   SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/profile` | Get current user profile | Yes |
| GET | `/:userId` | Get user profile by ID | Yes |
| PUT | `/about` | Update user about section | Yes |

### Post Routes (`/api/post`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/allPost` | Get all posts | No |
| GET | `/post/:id` | Get specific post | Yes |
| GET | `/user` | Get current user's posts | Yes |
| GET | `/user/:userId` | Get posts by user ID | Yes |
| POST | `/create-post` | Create new post | Yes |

## 🎯 Usage Examples

### User Registration
```javascript
POST /api/auth/signup
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### User Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Create Post
```javascript
POST /api/post/create-post
Headers: { "Authorization": "Bearer <token>" }
{
  "title": "My First Post",
  "content": "This is the content of my post"
}
```

### Update About Section
```javascript
PUT /api/auth/about
Headers: { "Authorization": "Bearer <token>" }
{
  "about": "Software developer passionate about open source"
}
```

## 🔒 Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication. Protected routes require the `authenticateJWT` middleware which:

- Verifies the JWT token from cookies
- Attaches user information to the request object
- Returns 403 Forbidden for invalid tokens

## 🗄 Database Models

### User Model
```javascript
{
  username: String (required),
  email: String (required, unique),
  password: String (required),
  about: String,
  timestamps: true
}
```

### Post Model
```javascript
{
  author: ObjectId (ref: User, required),
  title: String (required),
  content: String (required),
  tags: [String],
  image: String,
  likes: [ObjectId (ref: User)],
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  isPublished: Boolean (default: true),
  views: Number (default: 0),
  timestamps: true
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure all endpoints return appropriate HTTP status codes

## 🐛 Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## 🔧 Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aditya Rana**

## 🆘 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Note**: Make sure MongoDB is running and accessible at the specified MONGO_URI before starting the server.
