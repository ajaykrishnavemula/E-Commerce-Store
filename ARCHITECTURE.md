# Commerce-Pro System Architecture

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [Payment Processing](#payment-processing)
8. [Email System](#email-system)
9. [State Management](#state-management)
10. [Error Handling](#error-handling)
11. [Security Architecture](#security-architecture)
12. [Deployment Architecture](#deployment-architecture)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite + TypeScript + Tailwind CSS)  │  │
│  │  - Pages & Components                                │  │
│  │  - Zustand State Management                          │  │
│  │  - Stripe Elements UI                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Backend (Node.js + TypeScript)          │  │
│  │  - RESTful API Endpoints                             │  │
│  │  - JWT Authentication                                │  │
│  │  - Business Logic Services                           │  │
│  │  - Stripe Payment Integration                        │  │
│  │  - Email Service (Nodemailer)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                     │  │
│  │  - Users Collection                                   │  │
│  │  - Products Collection                                │  │
│  │  - Orders Collection                                  │  │
│  │  - Carts Collection                                   │  │
│  │  - Reviews Collection                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ External APIs
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Stripe     │  │    SMTP      │  │   Storage    │     │
│  │   Payment    │  │   Server     │  │   (Images)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      Routes Layer                            │
│  - Define API endpoints                                      │
│  - Apply middleware (auth, validation)                       │
│  - Route requests to controllers                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Controllers Layer                          │
│  - Handle HTTP requests/responses                            │
│  - Input validation                                          │
│  - Call service layer                                        │
│  - Format responses                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│  - Business logic implementation                             │
│  - Data processing                                           │
│  - External API integration                                  │
│  - Transaction management                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Models Layer                             │
│  - Mongoose schemas                                          │
│  - Data validation                                           │
│  - Database operations                                       │
│  - Relationships                                             │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── config/
│   └── index.ts              # Configuration management
├── controllers/
│   ├── authController.ts     # Authentication logic
│   ├── userController.ts     # User management
│   ├── productController.ts  # Product operations
│   ├── cartController.ts     # Cart management
│   ├── orderController.ts    # Order processing
│   ├── reviewController.ts   # Review handling
│   └── paymentController.ts  # Payment processing
├── middleware/
│   ├── auth.ts              # JWT authentication
│   ├── admin.ts             # Admin authorization
│   ├── errorHandler.ts      # Error handling
│   └── validation.ts        # Input validation
├── models/
│   ├── User.ts              # User schema
│   ├── Product.ts           # Product schema
│   ├── Order.ts             # Order schema
│   ├── Cart.ts              # Cart schema
│   └── Review.ts            # Review schema
├── routes/
│   ├── auth.ts              # Auth routes
│   ├── users.ts             # User routes
│   ├── products.ts          # Product routes
│   ├── cart.ts              # Cart routes
│   ├── orders.ts            # Order routes
│   ├── reviews.ts           # Review routes
│   └── payment.ts           # Payment routes
├── services/
│   ├── email.service.ts     # Email functionality
│   └── stripe.service.ts    # Stripe integration
├── utils/
│   ├── jwt.ts               # JWT utilities
│   └── helpers.ts           # Helper functions
├── errors/
│   └── custom-error.ts      # Custom error classes
├── types/
│   └── express.d.ts         # TypeScript definitions
├── app.ts                   # Express app setup
└── server.ts                # Server entry point
```

## Frontend Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  - Main application component                                │
│  - Routing configuration                                     │
│  - Global providers (Stripe, Toast)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Pages Layer                             │
│  - Home, Products, Cart, Checkout                            │
│  - Orders, Profile, Admin                                    │
│  - Auth (Login, Register)                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Components Layer                           │
│  - Reusable UI components                                    │
│  - Layout components                                         │
│  - Feature-specific components                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│  - API communication                                         │
│  - Data fetching                                             │
│  - Error handling                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Store Layer                              │
│  - Zustand state management                                  │
│  - Auth, Cart, Wishlist stores                               │
│  - Persistent state                                          │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/            # Feature components
│       ├── ProductCard.tsx
│       ├── CartItem.tsx
│       └── OrderCard.tsx
├── pages/
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── Profile.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Admin/
│       ├── Dashboard.tsx
│       ├── Products.tsx
│       └── Orders.tsx
├── services/
│   ├── api.ts               # Axios configuration
│   ├── auth.service.ts      # Auth API calls
│   ├── product.service.ts   # Product API calls
│   ├── cart.service.ts      # Cart API calls
│   ├── order.service.ts     # Order API calls
│   └── payment.service.ts   # Payment API calls
├── store/
│   ├── authStore.ts         # Auth state
│   ├── cartStore.ts         # Cart state
│   └── wishlistStore.ts     # Wishlist state
├── types/
│   └── index.ts             # TypeScript types
├── utils/
│   └── helpers.ts           # Utility functions
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │   Product   │         │    Order    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ _id         │────┐    │ _id         │    ┌────│ _id         │
│ name        │    │    │ name        │    │    │ user        │
│ email       │    │    │ description │    │    │ items[]     │
│ password    │    │    │ price       │    │    │ total       │
│ role        │    │    │ category    │    │    │ status      │
│ address     │    │    │ stock       │    │    │ payment     │
└─────────────┘    │    │ images[]    │    │    └─────────────┘
                   │    │ rating      │    │
                   │    └─────────────┘    │
                   │                       │
                   │    ┌─────────────┐   │
                   └────│    Cart     │───┘
                        ├─────────────┤
                        │ _id         │
                        │ user        │
                        │ items[]     │
                        │ total       │
                        └─────────────┘
                             │
                             │
                        ┌─────────────┐
                        │   Review    │
                        ├─────────────┤
                        │ _id         │
                        │ user        │
                        │ product     │
                        │ rating      │
                        │ comment     │
                        └─────────────┘
```

### Collections Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['customer', 'admin']),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  description: String,
  price: Number,
  category: String (indexed),
  subcategory: String,
  brand: String,
  stock: Number,
  images: [String],
  rating: Number,
  numReviews: Number,
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Orders Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  items: [{
    product: ObjectId (ref: 'Product'),
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String,
  paymentResult: {
    id: String,
    status: String,
    update_time: String
  },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Carts Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', unique, indexed),
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number
  }],
  totalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Reviews Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', indexed),
  product: ObjectId (ref: 'Product', indexed),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Products
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1 })
db.products.createIndex({ rating: -1 })

// Orders
db.orders.createIndex({ user: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: -1 })

// Carts
db.carts.createIndex({ user: 1 }, { unique: true })

// Reviews
db.reviews.createIndex({ product: 1 })
db.reviews.createIndex({ user: 1, product: 1 }, { unique: true })
```

## API Design

### RESTful Endpoints

#### Authentication Endpoints
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
POST   /api/v1/auth/logout            # Logout user
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password
GET    /api/v1/auth/verify-email      # Verify email
```

#### User Endpoints
```
GET    /api/v1/users/profile          # Get user profile
PUT    /api/v1/users/profile          # Update profile
PUT    /api/v1/users/password         # Change password
DELETE /api/v1/users/account          # Delete account
```

#### Product Endpoints
```
GET    /api/v1/products               # Get all products (with filters)
GET    /api/v1/products/:id           # Get single product
POST   /api/v1/products               # Create product (admin)
PUT    /api/v1/products/:id           # Update product (admin)
DELETE /api/v1/products/:id           # Delete product (admin)
GET    /api/v1/products/search        # Search products
GET    /api/v1/products/featured      # Get featured products
```

#### Cart Endpoints
```
GET    /api/v1/cart                   # Get user cart
POST   /api/v1/cart/items             # Add item to cart
PUT    /api/v1/cart/items/:id         # Update cart item
DELETE /api/v1/cart/items/:id         # Remove cart item
DELETE /api/v1/cart                   # Clear cart
```

#### Order Endpoints
```
GET    /api/v1/orders                 # Get user orders
GET    /api/v1/orders/:id             # Get single order
POST   /api/v1/orders                 # Create order
PUT    /api/v1/orders/:id/cancel      # Cancel order
GET    /api/v1/admin/orders           # Get all orders (admin)
PUT    /api/v1/admin/orders/:id       # Update order status (admin)
```

#### Review Endpoints
```
GET    /api/v1/reviews/product/:id    # Get product reviews
POST   /api/v1/reviews                # Create review
PUT    /api/v1/reviews/:id            # Update review
DELETE /api/v1/reviews/:id            # Delete review
```

#### Payment Endpoints
```
POST   /api/v1/payment/create-intent  # Create payment intent
POST   /api/v1/payment/confirm        # Confirm payment
GET    /api/v1/payment/:id            # Get payment status
POST   /api/v1/payment/webhook        # Stripe webhook
POST   /api/v1/payment/refund         # Create refund (admin)
```

### Request/Response Format

#### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Standard Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "errors": [ ... ]
  }
}
```

#### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Authentication & Authorization

### JWT Token Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │  1. POST /auth/login                          │
     │  { email, password }                          │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                                    2. Validate credentials
     │                                    3. Generate JWT token
     │                                                │
     │  4. Return token                              │
     │  { token, user }                              │
     │<──────────────────────────────────────────────┤
     │                                                │
     │  5. Store token in localStorage               │
     │                                                │
     │  6. GET /products                             │
     │  Authorization: Bearer <token>                │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                                    7. Verify token
     │                                    8. Process request
     │                                                │
     │  9. Return response                           │
     │<──────────────────────────────────────────────┤
     │                                                │
```

### Middleware Chain

```javascript
// Protected Route Example
router.get('/profile',
  authenticate,      // Verify JWT token
  getProfile        // Controller function
);

// Admin Route Example
router.post('/products',
  authenticate,      // Verify JWT token
  authorize('admin'), // Check admin role
  createProduct     // Controller function
);
```

## Payment Processing

### Stripe Payment Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│  Client  │                  │  Server  │                  │  Stripe  │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                              │                              │
     │  1. Initiate checkout        │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │  2. Create payment intent    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │  3. Return client secret     │
     │                              │<─────────────────────────────┤
     │                              │                              │
     │  4. Return client secret     │                              │
     │<─────────────────────────────┤                              │
     │                              │                              │
     │  5. Collect payment details  │                              │
     │  (Stripe Elements)           │                              │
     │                              │                              │
     │  6. Confirm payment          │                              │
     ├──────────────────────────────┼─────────────────────────────>│
     │                              │                              │
     │                              │  7. Process payment          │
     │                              │                              │
     │  8. Payment result           │                              │
     │<─────────────────────────────┼──────────────────────────────┤
     │                              │                              │
     │  9. Confirm with backend     │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │  10. Verify payment          │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │                              │  11. Payment confirmed       │
     │                              │<─────────────────────────────┤
     │                              │                              │
     │                              │  12. Create order            │
     │                              │  13. Update inventory        │
     │                              │  14. Send email              │
     │                              │                              │
     │  15. Order confirmation      │                              │
     │<─────────────────────────────┤                              │
     │                              │                              │
```

### Webhook Handling

```javascript
// Stripe sends webhook events for:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_intent.canceled
// - charge.refunded

// Webhook verification
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  webhookSecret
);

// Handle event
switch (event.type) {
  case 'payment_intent.succeeded':
    // Update order status
    // Send confirmation email
    break;
  case 'payment_intent.payment_failed':
    // Notify user
    // Log failure
    break;
}
```

## Email System

### Email Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Service                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Template   │  │  Nodemailer  │  │     SMTP     │     │
│  │   Engine     │  │   Transport  │  │    Server    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Email Types:                                                │
│  - Welcome Email                                             │
│  - Order Confirmation                                        │
│  - Order Status Update                                       │
│  - Password Reset                                            │
│  - Email Verification                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Email Templates

```html
<!-- Order Confirmation Template -->
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline CSS for email compatibility */
  </style>
</head>
<body>
  <div class="container">
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <div class="order-details">
      <!-- Order items -->
    </div>
    <div class="total">
      Total: ${{totalAmount}}
    </div>
  </div>
</body>
</html>
```

## State Management

### Zustand Store Architecture

```javascript
// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

// Cart Store
interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Wishlist Store
interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}
```

### State Persistence

```javascript
// Persist auth state
const authStore = create(
  persist(
    (set) => ({
      // state and actions
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

## Error Handling

### Error Hierarchy

```
Error
  └── CustomError
        ├── BadRequestError (400)
        ├── UnauthorizedError (401)
        ├── ForbiddenError (403)
        ├── NotFoundError (404)
        ├── ConflictError (409)
        └── InternalServerError (500)
```

### Error Handling Flow

```javascript
// Controller
try {
  const result = await service.operation();
  res.json({ success: true, data: result });
} catch (error) {
  next(error); // Pass to error handler
}

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
```

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Security                      │
├─────────────────────────────────────────────────────────────┤
│  1. Rate Limiting                                            │
│     - Prevent brute force attacks                            │
│     - Limit API requests per IP                              │
│                                                              │
│  2. Input Validation                                         │
│     - Sanitize user input                                    │
│     - Validate data types                                    │
│     - Prevent injection attacks                              │
│                                                              │
│  3. Authentication                                           │
│     - JWT token verification                                 │
│     - Password hashing (bcrypt)                              │
│     - Session management                                     │
│                                                              │
│  4. Authorization                                            │
│     - Role-based access control                              │
│     - Resource ownership verification                        │
│                                                              │
│  5. HTTPS/TLS                                                │
│     - Encrypted communication                                │
│     - SSL certificates                                       │
│                                                              │
│  6. CORS Configuration                                       │
│     - Whitelist allowed origins                              │
│     - Control access methods                                 │
│                                                              │
│  7. Security Headers                                         │
│     - Helmet middleware                                      │
│     - XSS protection                                         │
│     - CSRF protection                                        │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend                                       │  │
│  │  - Static assets served via CDN                       │  │
│  │  - Automatic HTTPS                                    │  │
│  │  - Edge network deployment                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                        Railway                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Backend                                   │  │
│  │  - Auto-scaling                                       │  │
│  │  - Health checks                                      │  │
│  │  - Environment variables                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Atlas                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Cluster                                     │  │
│  │  - Automatic backups                                  │  │
│  │  - Replica sets                                       │  │
│  │  - Monitoring                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌──────────────┐
│   GitHub     │
│  Repository  │
└──────┬───────┘
       │
       │ Push to main
       ↓
┌──────────────┐
│   Vercel     │
│   Deploy     │
└──────┬───────┘
       │
       │ Build & Deploy Frontend
       ↓
┌──────────────┐
│   Railway    │
│   Deploy     │
└──────┬───────┘
       │
       │ Build & Deploy Backend
       ↓
┌──────────────┐
│  Production  │
│   Live       │
└──────────────┘
```

## Performance Optimization

### Backend Optimization
- Database query optimization with indexes
- Response caching
- Compression middleware
- Connection pooling
- Lazy loading

### Frontend Optimization
- Code splitting
- Lazy loading routes
- Image optimization
- Bundle size reduction
- Service worker caching

## Monitoring & Logging

### Logging Strategy
```javascript
// Request logging
app.use(morgan('combined'));

// Error logging
logger.error('Error message', {
  error: err,
  user: req.user,
  path: req.path
});

// Payment logging
logger.info('Payment processed', {
  orderId,
  amount,
  status
});
```

### Monitoring Metrics
- API response times
- Error rates
- Database query performance
- Payment success rates
- User activity

## Conclusion

This architecture provides a scalable, secure, and maintainable foundation for the Commerce-Pro e-commerce platform. The separation of concerns, layered architecture, and modern technology stack ensure the application can grow and adapt to changing requirements.