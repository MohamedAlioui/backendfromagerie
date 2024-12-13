# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Orders](#orders)
5. [Cart](#cart)
6. [Loyalty](#loyalty)
7. [Recipes](#recipes)
8. [Reviews](#reviews)

## Authentication

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password/:token` | Reset password | Public |

### Models

#### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

#### Profile Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  phoneNumber: String,
  address: String,
  preferences: Object
}
```

## Products

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/products` | Get all products | Public |
| GET | `/products/:id` | Get single product | Public |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### Models

#### Product Model
```javascript
{
  name: String (required),
  description: String,
  price: Number (required),
  category: String,
  images: [String],
  stock: Number (default: 0),
  isAvailable: Boolean (default: true)
}
```

## Orders

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/orders` | Get user orders | Protected |
| GET | `/orders/:id` | Get order details | Protected |
| POST | `/orders` | Create order | Protected |
| PUT | `/orders/:id/status` | Update order status | Admin |

### Models

#### Order Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  items: [{
    productId: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered']),
  shippingAddress: Object,
  paymentStatus: String
}
```

## Cart

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/cart` | Get user's cart | Protected |
| POST | `/cart/add` | Add item to cart | Protected |
| PUT | `/cart/update/:itemId` | Update cart item | Protected |
| DELETE | `/cart/remove/:itemId` | Remove item from cart | Protected |
| DELETE | `/cart/clear` | Clear cart | Protected |

### Models

#### Cart Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  items: [{
    productId: ObjectId (ref: 'Product'),
    quantity: Number
  }],
  lastUpdated: Date
}
```

## Loyalty

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/loyalty/points` | Get loyalty points | Protected |
| GET | `/loyalty/history` | Get points history | Protected |
| GET | `/loyalty/tiers` | Get loyalty tiers | Protected |
| POST | `/loyalty/redeem` | Redeem points | Protected |
| POST | `/loyalty/add` | Add points | Protected |

### Models

#### Loyalty Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  points: Number (default: 0),
  tier: String (enum: ['bronze', 'silver', 'gold', 'platinum']),
  history: [{
    action: String,
    points: Number,
    date: Date
  }]
}
```

## Recipes

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/recipes` | Get all recipes | Public |
| GET | `/recipes/:id` | Get recipe details | Public |
| POST | `/recipes` | Create recipe | Admin |
| PUT | `/recipes/:id` | Update recipe | Admin |
| DELETE | `/recipes/:id` | Delete recipe | Admin |

### Models

#### Recipe Model
```javascript
{
  name: String (required),
  description: String,
  ingredients: [{
    item: String,
    amount: String
  }],
  instructions: [String],
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  images: [String]
}
```

## Reviews

### Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/reviews/product/:productId` | Get product reviews | Public |
| POST | `/reviews` | Create review | Protected |
| PUT | `/reviews/:id` | Update review | Protected |
| DELETE | `/reviews/:id` | Delete review | Protected |
| POST | `/reviews/:id/helpful` | Mark review as helpful | Protected |

### Models

#### Review Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  productId: ObjectId (ref: 'Product'),
  rating: Number (required, min: 1, max: 5),
  comment: String,
  images: [String],
  helpful: [{
    userId: ObjectId (ref: 'User')
  }],
  date: Date (default: Date.now)
}
```

## Error Handling

All endpoints follow a consistent error handling pattern:

```javascript
{
  success: boolean,
  message: string,
  error?: string,
  data?: any
}
```

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per IP per 15 minutes for public routes
- 1000 requests per IP per 15 minutes for authenticated routes

## Caching

Certain GET endpoints (products, recipes) implement caching to improve performance:
- Cache duration: 5 minutes
- Cache invalidation on related POST/PUT/DELETE operations
