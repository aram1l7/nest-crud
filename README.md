# User CRUD API with JWT Authentication

## 📌 Overview
This is a simple **User CRUD API** built with **NestJS**, using **JWT-based authentication** for secure access. The API allows users to **register, log in, and perform CRUD operations** on user data.

## 🛠 Installation & Setup
### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/aram1l7/nest-crud
cd nest-crud
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

### 3️⃣ **Set Up Environment Variables**
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/usersdb"
NODE_ENV=development
JWT_SECRET=customJwtSecret
```

### 4️⃣ **Run Migrations (If using Prisma)**
```sh
npx prisma migrate dev
```

### 5️⃣ **Start the Application**
#### 🚀 Development Mode
```sh
npm run start:dev
```
#### 🔥 Production Mode
```sh
npm run build
npm run start:prod
```

## 🧪 Running Tests
```sh
npm run test
```


---

## 🔐 Authentication Flow
### **1️⃣ Create a User (Signup)**
**Endpoint:** `POST /users/create`

**Payload:**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securePassword"
}
```

### **2️⃣ Login and Get JWT Token**
**Endpoint:** `POST /auth/login`

**Payload:**
```json
{
  "email": "johndoe@example.com",
  "password": "securePassword"
}
```

**Response:**
```json
{
  "access_token": "your.jwt.token.here"
}
```

### **3️⃣ Use the JWT Token for Protected Routes**
For all protected routes, include the token in the **Authorization** header:
```
Authorization: Bearer your.jwt.token.here
```

---

## 🚀 API Endpoints
### **Public Endpoints**
✅ `POST /users/create` → **Register a new user** (No authentication required)
✅ `POST /auth/login` → **Login and receive JWT token**

### **Protected Endpoints (Require Bearer Token)**
🔒 `GET /auth/profile` → **Get the authenticated user’s profile**
🔒 `GET /users` → **Get all users**
🔒 `GET /users/:id` → **Get a user by id (if authorized)**
🔒 `PUT /users/:id` → **Update a user (if authorized)**
🔒 `DELETE /users/:id` → **Delete a user (if authorized)**

---

## 🏗 Tech Stack
- **NestJS** - Framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Passport.js** - Authentication
- **JWT (JSON Web Tokens)** - Secure API access

---

## 📝 Notes
- The `JWT_SECRET` should be kept secure in a `.env` file and not hardcoded.
- The default **token expiration** is `1 hour` (can be changed in `auth.module.ts`).
- Ensure PostgreSQL is running before starting the application.


