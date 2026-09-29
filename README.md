# Contact Management System (MERN Stack)

A professional, full-featured **Contact Management System** built with **Node.js, Express.js, MongoDB (Mongoose), and React 19 (Vite)**.

---

## 🌟 Key Features

### Backend (Node.js & Express)
* **JWT Authentication**: Secure user registration and login with `bcryptjs` password hashing.
* **Multi-Tenant User Isolation**: Every contact is strictly owned by the authenticated user (`user` ObjectId reference). Users cannot read, modify, or delete another user's contacts.
* **Per-User Uniqueness**: Enforces compound unique indexing (`{ user: 1, email: 1 }`), preventing duplicate contacts for the same user while allowing different users to save common contacts.
* **Nested Schemas**: Full support for nested addresses (`street`, `city`, `state`, `pincode`) and company information (`name`, `jobTitle`, `department`).
* **Multi-Field Search**: Real-time regex-escaped search across `name`, `email`, and `phone` with ReDoS protection.
* **Dynamic Sorting**: Whitelist-guarded sorting across `name`, `email`, `company`, `createdAt`, and `updatedAt`.
* **Robust Pagination**: Page and limit controls with full metadata (`currentPage`, `totalPages`, `totalContacts`, `hasNextPage`, `hasPrevPage`).
* **Clean Layered Architecture**: Routes → Middleware → Controllers → Services → Models.
* **Security & Hardening**: `helmet`, `cors`, request body limits, centralized error handling (`ApiError`, Mongoose `CastError`, `ValidationError`, duplicate key `11000`, JWT errors).

### Frontend (React 19 & Vite)
* **Modern UI & UX**: Clean, responsive layout with design tokens, CSS variables, and Lucide icons.
* **Authentication Flow**: Dedicated login and signup forms with persistent token management.
* **Contacts Dashboard**: Full table view with contact avatar initials, direct mail/tel links, and company badges.
* **Debounced Search**: Responsive search bar with auto-clear and 350ms debounce.
* **Sortable Column Headers**: Click-to-sort columns with interactive sort direction arrows.
* **Interactive Modals**:
  * **Create / Edit Contact**: Form with input validation, nested address, and company fields.
  * **View Contact Details**: Full contact profile card.
  * **Delete Confirmation**: Safe confirmation dialog.
* **Toast Notifications**: Auto-dismissing success and error alerts.

---

## 📁 Project Architecture

```text
antigravity/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & graceful shutdown
│   ├── controllers/
│   │   ├── auth.controller.js     # Auth request handlers
│   │   └── contact.controller.js  # Contact request handlers
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT Bearer token guard
│   │   ├── error.middleware.js    # Centralized operational error & 404 handler
│   │   └── validation.middleware.js# Express-validator result parser
│   ├── models/
│   │   ├── User.js                # User model with bcrypt & schema methods
│   │   └── Contact.js             # Contact model with nested schemas & indexes
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth routes
│   │   └── contact.routes.js      # /api/contacts routes
│   ├── services/
│   │   ├── auth.service.js        # Business logic for auth
│   │   └── contact.service.js     # Business logic for contact queries & CRUD
│   ├── utils/
│   │   ├── apiError.js            # Standardized ApiError class
│   │   ├── apiResponse.js         # Uniform JSON response helper
│   │   ├── asyncHandler.js        # Async try/catch wrapper
│   │   └── jwt.js                 # Token signing and verification
│   ├── validators/
│   │   ├── auth.validator.js      # Express-validator schemas for auth
│   │   └── contact.validator.js   # Express-validator schemas for contacts
│   ├── app.js                     # Express app setup & middleware
│   └── server.js                  # Server entry & process lifecycle listeners
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios client with JWT interceptor & error parsing
│   │   ├── components/
│   │   │   ├── AuthModal.jsx      # Login & Signup view
│   │   │   ├── ContactList.jsx    # Table with sortable columns & actions
│   │   │   ├── ContactModal.jsx   # Create & Edit modal
│   │   │   ├── DeleteModal.jsx    # Delete confirmation modal
│   │   │   ├── Navbar.jsx         # Header with user avatar & logout
│   │   │   ├── Pagination.jsx     # Pagination bar with limit selection
│   │   │   ├── SearchBar.jsx      # Debounced search bar
│   │   │   ├── Toast.jsx          # Notification alert banner
│   │   │   └── ViewModal.jsx      # Single contact profile modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global authentication provider
│   │   ├── styles/
│   │   │   └── index.css          # Modern stylesheet
│   │   ├── App.jsx                # Main dashboard container
│   │   └── main.jsx               # React entry point
│   ├── vite.config.js             # Vite config with backend API proxy
│   └── package.json
│
├── .env                           # Backend environment variables
├── .env.example                   # Environment variable template
└── package.json                   # Backend root package config
```

---

## 🚀 Getting Started

### 1. Configure MongoDB Connection

In the root `.env` file, set your `MONGODB_URI`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/contact_management?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey_change_in_production_contact_mgmt_123
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 2. Start the Backend Server

```bash
# In the root directory:
npm run dev
# The backend will start on http://localhost:5000
```

### 3. Start the Frontend Application

```bash
# Open a new terminal in the root directory:
npm run client
# Or navigate to frontend and run:
cd frontend
npm run dev
# The frontend will start on http://localhost:3000
```

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & get token | Public |
| `GET` | `/api/auth/me` | Get current user profile | Private |

### Contacts Endpoints

| Method | Endpoint | Query Parameters | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/contacts` | — | Create contact | Private |
| `GET` | `/api/contacts` | `search`, `sortBy`, `order`, `page`, `limit` | Get contacts with search, sort, & pagination | Private |
| `GET` | `/api/contacts/:id` | — | Get single contact by ID | Private |
| `PATCH` | `/api/contacts/:id` | — | Partial update contact | Private |
| `DELETE` | `/api/contacts/:id` | — | Delete contact | Private |
