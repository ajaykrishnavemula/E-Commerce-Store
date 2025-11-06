# Commerce Pro API Documentation

Complete API reference for the Commerce Pro e-commerce platform.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Update Profile
```http
PUT /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Change Password
```http
PUT /auth/password
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### Products

#### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `search` (string): Search query
- `sort` (string): Sort field (price, rating, createdAt)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "electronics",
      "images": ["url1", "url2"],
      "stock": 50,
      "rating": 4.5,
      "numReviews": 10,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9
  }
}
```

#### Get Product by ID
```http
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "electronics",
    "images": ["url1", "url2"],
    "stock": 50,
    "rating": 4.5,
    "numReviews": 10,
    "reviews": [
      {
        "_id": "review_id",
        "user": {
          "_id": "user_id",
          "name": "John Doe"
        },
        "rating": 5,
        "comment": "Great product!",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Create Product Review
```http
POST /products/:id/reviews
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

### Orders

#### Create Order
```http
POST /orders
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-20240101-001",
    "user": "user_id",
    "items": [...],
    "totalAmount": 199.98,
    "status": "pending",
    "paymentStatus": "paid",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get User Orders
```http
GET /orders
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20240101-001",
      "items": [...],
      "totalAmount": 199.98,
      "status": "delivered",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

#### Get Order by ID
```http
GET /orders/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-20240101-001",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "product": {
          "_id": "product_id",
          "name": "Product Name",
          "image": "url"
        },
        "quantity": 2,
        "price": 99.99
      }
    ],
    "totalAmount": 199.98,
    "status": "delivered",
    "paymentStatus": "paid",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Cancel Order
```http
PUT /orders/:id/cancel
```

**Headers:** `Authorization: Bearer <token>`

### Payment

#### Create Payment Intent
```http
POST /payment/create-intent
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 19998,
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx"
}
```

### Admin Endpoints

All admin endpoints require `role: 'admin'`

#### Get Dashboard Stats
```http
GET /admin/stats
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRevenue": 50000,
    "totalOrders": 500,
    "totalProducts": 100,
    "totalUsers": 1000,
    "revenueGrowth": 15.5,
    "ordersGrowth": 10.2,
    "productsGrowth": 5.0,
    "usersGrowth": 20.0
  }
}
```

#### Get Recent Orders
```http
GET /admin/orders/recent
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "orders": [...]
}
```

#### Get Top Products
```http
GET /admin/products/top
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "sales": 100,
      "revenue": 9999,
      "image": "url"
    }
  ]
}
```

#### Create Product
```http
POST /admin/products
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "images": ["url1", "url2"],
  "stock": 50
}
```

#### Update Product
```http
PUT /admin/products/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as create

#### Delete Product
```http
DELETE /admin/products/:id
```

**Headers:** `Authorization: Bearer <token>`

#### Get All Orders (Admin)
```http
GET /admin/orders
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** Same as user orders

#### Update Order Status
```http
PUT /admin/orders/:id/status
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Status Values:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

#### Get All Users
```http
GET /admin/users
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Update User Role
```http
PUT /admin/users/:id/role
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "admin"
}
```

#### Delete User
```http
DELETE /admin/users/:id
```

**Headers:** `Authorization: Bearer <token>`

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Admin endpoints**: 200 requests per 15 minutes

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Filtering and Sorting

### Products
- Filter by: `category`, `minPrice`, `maxPrice`, `search`
- Sort by: `price`, `rating`, `createdAt`, `name`
- Order: `asc`, `desc`

### Orders
- Filter by: `status`, `paymentStatus`
- Sort by: `createdAt`, `totalAmount`

## Webhooks

### Stripe Webhook
```http
POST /webhooks/stripe
```

Handles Stripe payment events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Testing

Use the following test credentials:

**Regular User:**
- Email: `user@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Support

For API support, contact: support@commercepro.com