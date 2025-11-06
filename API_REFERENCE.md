# Commerce-Store - Complete API Reference

> **Comprehensive API documentation for the E-Commerce Platform**

**Base URL**: `http://localhost:5000/api/v1`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Reviews](#reviews)
- [Wishlist](#wishlist)
- [Search](#search)
- [Admin](#admin)
- [Error Responses](#error-responses)

---

## 🔐 Authentication

Protected endpoints require JWT token:
```http
Authorization: Bearer <your-jwt-token>
```

---

## 🛍️ Products

### 1. Get All Products

Retrieve paginated list of products.

**Endpoint**: `GET /products`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sort` (optional): Sort by (price, name, rating, createdAt)
- `order` (optional): Sort order (asc, desc)
- `search` (optional): Search query

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones",
        "price": 99.99,
        "category": "Electronics",
        "stock": 50,
        "images": ["url1.jpg", "url2.jpg"],
        "rating": 4.5,
        "reviewCount": 120,
        "featured": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20
    }
  }
}
```

---

### 2. Get Product by ID

Get detailed product information.

**Endpoint**: `GET /products/:id`

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 99.99,
      "compareAtPrice": 149.99,
      "category": "Electronics",
      "subcategory": "Audio",
      "brand": "TechBrand",
      "sku": "WH-1000XM4",
      "stock": 50,
      "images": ["url1.jpg", "url2.jpg", "url3.jpg"],
      "specifications": {
        "color": "Black",
        "weight": "250g",
        "battery": "30 hours"
      },
      "rating": 4.5,
      "reviewCount": 120,
      "featured": true,
      "tags": ["wireless", "noise-cancelling", "bluetooth"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Product (Admin)

Create a new product.

**Endpoint**: `POST /products`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones",
  "price": 99.99,
  "compareAtPrice": 149.99,
  "category": "Electronics",
  "subcategory": "Audio",
  "brand": "TechBrand",
  "sku": "WH-1000XM4",
  "stock": 50,
  "images": ["url1.jpg", "url2.jpg"],
  "specifications": {
    "color": "Black",
    "weight": "250g"
  },
  "tags": ["wireless", "bluetooth"]
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Wireless Headphones",
      "price": 99.99,
      "stock": 50
    }
  }
}
```

---

### 4. Update Product (Admin)

Update existing product.

**Endpoint**: `PATCH /products/:id`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Request Body** (partial update):
```json
{
  "price": 89.99,
  "stock": 75,
  "featured": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Wireless Headphones",
      "price": 89.99,
      "stock": 75
    }
  }
}
```

---

### 5. Delete Product (Admin)

Delete a product.

**Endpoint**: `DELETE /products/:id`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🛒 Cart

### 1. Get Cart

Get user's shopping cart.

**Endpoint**: `GET /cart`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439013",
          "name": "Wireless Headphones",
          "price": 99.99,
          "quantity": 2,
          "image": "url.jpg",
          "subtotal": 199.98
        }
      ],
      "subtotal": 199.98,
      "tax": 19.99,
      "shipping": 10.00,
      "total": 229.97,
      "itemCount": 2
    }
  }
}
```

---

### 2. Add to Cart

Add item to cart.

**Endpoint**: `POST /cart/items`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 2
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": {
      "itemCount": 3,
      "total": 329.96
    }
  }
}
```

---

### 3. Update Cart Item

Update item quantity in cart.

**Endpoint**: `PATCH /cart/items/:productId`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "quantity": 3
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "cart": {
      "itemCount": 4,
      "total": 429.95
    }
  }
}
```

---

### 4. Remove from Cart

Remove item from cart.

**Endpoint**: `DELETE /cart/items/:productId`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 5. Clear Cart

Remove all items from cart.

**Endpoint**: `DELETE /cart`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📦 Orders

### 1. Create Order

Create new order from cart.

**Endpoint**: `POST /orders`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardToken": "tok_visa"
  }
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-2024-001",
      "status": "pending",
      "total": 229.97,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 2. Get User Orders

Get all orders for authenticated user.

**Endpoint**: `GET /orders`

**Headers**:
```http
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "507f1f77bcf86cd799439011",
        "orderNumber": "ORD-2024-001",
        "status": "delivered",
        "total": 229.97,
        "itemCount": 2,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

---

### 3. Get Order by ID

Get detailed order information.

**Endpoint**: `GET /orders/:id`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-2024-001",
      "status": "delivered",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439013",
          "name": "Wireless Headphones",
          "price": 99.99,
          "quantity": 2,
          "subtotal": 199.98
        }
      ],
      "subtotal": 199.98,
      "tax": 19.99,
      "shipping": 10.00,
      "total": 229.97,
      "shippingAddress": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102"
      },
      "trackingNumber": "1Z999AA10123456784",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "deliveredAt": "2024-01-18T14:20:00.000Z"
    }
  }
}
```

---

### 4. Cancel Order

Cancel pending order.

**Endpoint**: `POST /orders/:id/cancel`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## ⭐ Reviews

### 1. Get Product Reviews

Get all reviews for a product.

**Endpoint**: `GET /products/:productId/reviews`

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `rating` (optional): Filter by rating

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "userName": "John Doe",
        "rating": 5,
        "title": "Excellent product!",
        "comment": "Best headphones I've ever owned",
        "verified": true,
        "helpful": 45,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 120,
      "ratingDistribution": {
        "5": 80,
        "4": 25,
        "3": 10,
        "2": 3,
        "1": 2
      }
    }
  }
}
```

---

### 2. Create Review

Add review for purchased product.

**Endpoint**: `POST /products/:productId/reviews`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Best headphones I've ever owned"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439011",
      "rating": 5,
      "title": "Excellent product!"
    }
  }
}
```

---

### 3. Update Review

Update existing review.

**Endpoint**: `PATCH /reviews/:id`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "rating": 4,
  "title": "Good product",
  "comment": "Updated review"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Review updated successfully"
}
```

---

### 4. Delete Review

Delete own review.

**Endpoint**: `DELETE /reviews/:id`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## ❤️ Wishlist

### 1. Get Wishlist

Get user's wishlist.

**Endpoint**: `GET /wishlist`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "wishlist": {
      "items": [
        {
          "productId": "507f1f77bcf86cd799439013",
          "name": "Wireless Headphones",
          "price": 99.99,
          "image": "url.jpg",
          "inStock": true,
          "addedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "itemCount": 5
    }
  }
}
```

---

### 2. Add to Wishlist

Add product to wishlist.

**Endpoint**: `POST /wishlist/items`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "507f1f77bcf86cd799439013"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Item added to wishlist"
}
```

---

### 3. Remove from Wishlist

Remove product from wishlist.

**Endpoint**: `DELETE /wishlist/items/:productId`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Item removed from wishlist"
}
```

---

## 🔍 Search

### 1. Search Products

Search products with filters.

**Endpoint**: `GET /search`

**Query Parameters**:
- `q` (required): Search query
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `rating` (optional): Minimum rating
- `inStock` (optional): Only in-stock items
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "price": 99.99,
        "rating": 4.5,
        "image": "url.jpg"
      }
    ],
    "totalResults": 45,
    "page": 1,
    "totalPages": 3
  }
}
```

---

## 👨‍💼 Admin

### 1. Get Dashboard Stats

Get admin dashboard statistics.

**Endpoint**: `GET /admin/dashboard`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sales": {
      "today": 5420.50,
      "thisWeek": 34250.75,
      "thisMonth": 145680.25
    },
    "orders": {
      "pending": 45,
      "processing": 120,
      "shipped": 230,
      "delivered": 1450
    },
    "products": {
      "total": 850,
      "lowStock": 23,
      "outOfStock": 5
    },
    "customers": {
      "total": 5420,
      "new": 145
    }
  }
}
```

---

### 2. Get All Orders (Admin)

Get all orders with filters.

**Endpoint**: `GET /admin/orders`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `status` (optional): Filter by status
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "507f1f77bcf86cd799439011",
        "orderNumber": "ORD-2024-001",
        "customerName": "John Doe",
        "status": "pending",
        "total": 229.97,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000
    }
  }
}
```

---

### 3. Update Order Status (Admin)

Update order status.

**Endpoint**: `PATCH /admin/orders/:id/status`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "status": "shipped",
  "trackingNumber": "1Z999AA10123456784",
  "notes": "Shipped via FedEx"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Common Errors

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Ajay Krishna (ajaykrishnatech@gmail.com)