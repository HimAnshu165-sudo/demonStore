# DemonStore — Admin Dashboard API Integration Contract

This document specifies the complete API contract for the **DemonStore Admin Dashboard** backend endpoints. Frontend developers can use this reference to integrate state management, components, and views.

---

## 1. Authentication & Authorization Flow

- **Session Cookie**: `demon_auth_token` (HTTP-only, automatic in browser requests)
- **Bearer Token**: Alternatively, requests can send `Authorization: Bearer <token>` in headers.
- **Role Enforcement**:
  - `role: "admin"` is required for all `/api/admin/*` endpoints.
  - Normal users (`role: "user"`) will receive `403 Forbidden`.
  - Unauthenticated requests will receive `401 Unauthorized`.
  - Disabled accounts (`status: "disabled"`) will receive `403 Forbidden`.

---

## 2. API Endpoints Overview

| Method | Endpoint | Auth | Admin | Description |
|---|---|---|---|---|
| `POST` | `/api/users/heartbeat` | Yes | No | Periodic active user activity heartbeat |
| `GET` | `/api/admin/dashboard` | Yes | Yes | High-level live platform metrics & stats |
| `GET` | `/api/admin/analytics` | Yes | Yes | Aggregated analytics (revenue, orders, users, products) |
| `GET` | `/api/admin/users` | Yes | Yes | Paginated users list with search & filters |
| `GET` | `/api/admin/users/:id` | Yes | Yes | User details with aggregated order metrics |
| `PATCH` | `/api/admin/users/:id/role` | Yes | Yes | Update user role (`user` / `admin`) |
| `PATCH` | `/api/admin/users/:id/status` | Yes | Yes | Update user status (`active` / `disabled`) |
| `GET` | `/api/admin/products` | Yes | Yes | Paginated products with search & filters |
| `POST` | `/api/admin/products` | Yes | Yes | Create a new catalog product |
| `GET` | `/api/admin/products/:id` | Yes | Yes | Get single product by ID, slug, or MongoDB ObjectId |
| `PATCH` | `/api/admin/products/:id` | Yes | Yes | Update product details |
| `DELETE` | `/api/admin/products/:id` | Yes | Yes | Delete product from catalog |
| `GET` | `/api/admin/orders` | Yes | Yes | Paginated customer orders with search & filters |
| `GET` | `/api/admin/orders/:id` | Yes | Yes | Get single order details |
| `PATCH` | `/api/admin/orders/:id` | Yes | Yes | Update order status |
| `PATCH` | `/api/admin/orders/:id/status` | Yes | Yes | Update order status (dedicated endpoint) |

---

## 3. Detailed Endpoint Specifications

### 3.1 Active User Heartbeat
`POST /api/users/heartbeat`

**Request Headers:**
```http
Cookie: demon_auth_token=...  OR  Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Heartbeat acknowledged",
  "lastSeen": "2026-09-03T04:30:00.000Z"
}
```

---

### 3.2 Admin Dashboard Overview
`GET /api/admin/dashboard`

**Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 120,
    "activeUsers": 14,
    "totalProducts": 45,
    "totalOrders": 320,
    "totalRevenue": 450000,
    "formattedRevenue": "₹4,50,000",
    "pendingOrders": 12,
    "confirmedOrders": 45,
    "shippedOrders": 80,
    "deliveredOrders": 175,
    "completedOrders": 175,
    "lowStockProducts": 3,
    "activeWindowMinutes": 5,
    "lowStockThreshold": 5
  }
}
```

---

### 3.3 Admin Analytics
`GET /api/admin/analytics?range=7d|30d|90d|1y` (Default: `30d`)

**Query Parameters:**
- `range`: `7d`, `30d`, `90d`, `1y`

**Success Response (200 OK):**
```json
{
  "success": true,
  "range": "30d",
  "startDate": "2026-08-04T04:30:00.000Z",
  "summary": {
    "totalRevenue": 245000,
    "formattedRevenue": "₹2,45,000",
    "totalOrders": 52,
    "averageOrderValue": 4712,
    "formattedAOV": "₹4,712",
    "newUsersCount": 28,
    "activeUsersCount": 14,
    "lowStockCount": 3
  },
  "revenue": {
    "timeline": [
      { "date": "2026-08-10", "revenue": 14999, "ordersCount": 3 }
    ],
    "total": 245000
  },
  "orders": {
    "statusDistribution": [
      { "status": "delivered", "count": 35, "totalValue": 165000 },
      { "status": "pending", "count": 7, "totalValue": 32000 }
    ],
    "timeline": [
      { "date": "2026-08-10", "count": 3 }
    ]
  },
  "users": {
    "timeline": [
      { "date": "2026-08-10", "count": 4 }
    ],
    "totalNewUsers": 28,
    "activeUsers": 14
  },
  "products": {
    "bestSellers": [
      {
        "productId": "tanjiro-hoodie",
        "slug": "tanjiro-haori-hoodie",
        "name": "Tanjiro Sun-Breathing Haori Hoodie",
        "image": "/assets/products/hoodie_01.png",
        "quantitySold": 42,
        "revenue": 209958
      }
    ],
    "categoryPerformance": [
      { "category": "Hoodies", "quantitySold": 84, "revenue": 419916, "ordersCount": 40 }
    ],
    "lowStockAlerts": [
      {
        "id": "rengoku-coat",
        "slug": "flame-hashira-trench-coat",
        "name": "Flame Hashira Trench Coat",
        "category": "Coats",
        "stock": 2,
        "price": 8999,
        "images": ["/assets/products/coat_01.png"]
      }
    ]
  }
}
```

---

### 3.4 User Management

#### List Users
`GET /api/admin/users?page=1&limit=20&search=tanjiro&role=user&status=active&sortBy=createdAt&sortOrder=desc`

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "users": [
    {
      "id": "65f123456789abcdef012345",
      "name": "Tanjiro Kamado",
      "email": "tanjiro@demoncorps.jp",
      "role": "user",
      "status": "active",
      "lastSeen": "2026-09-03T04:30:00.000Z",
      "createdAt": "2026-08-15T10:00:00.000Z",
      "updatedAt": "2026-09-03T04:30:00.000Z"
    }
  ]
}
```

#### Get User Details
`GET /api/admin/users/:id`

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "65f123456789abcdef012345",
    "name": "Tanjiro Kamado",
    "email": "tanjiro@demoncorps.jp",
    "role": "user",
    "status": "active",
    "lastSeen": "2026-09-03T04:30:00.000Z",
    "createdAt": "2026-08-15T10:00:00.000Z",
    "stats": {
      "totalOrders": 4,
      "totalSpent": 19996,
      "formattedTotalSpent": "₹19,996"
    },
    "recentOrders": [
      {
        "orderId": "ORD-123456-ABCD",
        "total": 4999,
        "status": "delivered",
        "createdAt": "2026-08-20T12:00:00.000Z"
      }
    ]
  }
}
```

#### Update User Role
`PATCH /api/admin/users/:id/role`

**Request Body:**
```json
{
  "role": "admin"
}
```
*(Allowed values: `"user"`, `"admin"`)*

#### Update User Status
`PATCH /api/admin/users/:id/status`

**Request Body:**
```json
{
  "status": "disabled"
}
```
*(Allowed values: `"active"`, `"disabled"`)*

---

### 3.5 Product Management

#### List Products
`GET /api/admin/products?page=1&limit=20&search=hoodie&category=Hoodies&stockStatus=in_stock&sortBy=price&sortOrder=desc`

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "products": [...]
}
```

#### Create Product
`POST /api/admin/products`

**Request Body:**
```json
{
  "name": "Upper Moon Three Akaza Hoodie",
  "slug": "upper-moon-three-akaza-hoodie",
  "category": "Hoodies",
  "price": 5499,
  "description": "Premium 450 GSM fleece hoodie featuring destructive death compass embroidery.",
  "character": "Akaza",
  "collection": "UPPER MOONS",
  "stock": 35,
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "images": ["/assets/products/akaza_hoodie.png"],
  "featured": true
}
```

#### Update Product
`PATCH /api/admin/products/:id` (Accepts `id`, `slug`, or `_id`)

**Request Body:**
```json
{
  "price": 4999,
  "stock": 25,
  "featured": false
}
```

#### Delete Product
`DELETE /api/admin/products/:id`

---

### 3.6 Order Management

#### List Orders
`GET /api/admin/orders?page=1&limit=20&search=tanjiro&status=pending&startDate=2026-08-01&endDate=2026-08-31&sortBy=createdAt&sortOrder=desc`

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "orders": [...]
}
```

#### Get Order Details
`GET /api/admin/orders/:orderId` (Accepts `orderId` or `_id`)

#### Update Order Status
`PATCH /api/admin/orders/:orderId/status` OR `PATCH /api/admin/orders/:orderId`

**Request Body:**
```json
{
  "status": "shipped"
}
```
*(Allowed statuses: `"pending"`, `"confirmed"`, `"shipped"`, `"delivered"`, `"cancelled"`)*

---

## 4. Standard Error Response Format

All error responses follow this standard format:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

| Status Code | Meaning |
|---|---|
| `400 Bad Request` | Malformed parameters, invalid fields, or safety violation (e.g. demoting last admin) |
| `401 Unauthorized` | Missing, expired, or invalid authentication session token |
| `403 Forbidden` | Authenticated user lacks administrator privileges or account is disabled |
| `404 Not Found` | Requested user, product, or order does not exist |
| `409 Conflict` | Duplicate resource (e.g. product slug or email already exists) |
| `500 Internal Server Error` | Unexpected server failure |
