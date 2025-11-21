# WebsiteRestaurant

A full-stack restaurant management platform with a RESTful API backend and vanilla JavaScript frontend. Manage reservations, menus, wine lists, daily specials, and customer communications.

## Project Structure

```
WebsiteRestaurant/
├── WebsiteRestaurant_API/      # Node.js Express Backend
│   ├── index.js                # Server entry point
│   ├── prismaClient.js         # Database client
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── routes/                 # API endpoints
│   │   ├── admins.js           # Admin management & auth
│   │   ├── dashboard.js        # Analytics & metrics
│   │   ├── menu.js             # Menu categories & items
│   │   ├── wines.js            # Wine catalog
│   │   ├── specials.js         # Daily specials
│   │   ├── reservations.js     # Table bookings
│   │   └── requests.js         # Contact forms & bans
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Sample data
│   └── postman/                # API testing collection
│
└── WebsiteRestaurant_FrontEnd/ # Vanilla HTML/CSS/JS Frontend
    ├── index.html              # Homepage
    ├── js/                     # JavaScript modules
    ├── pages/                  # HTML pages
    └── css/                    # Stylesheets
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js 5.1 |
| Database | MySQL |
| ORM | Prisma 6.19 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Frontend | HTML5, CSS3, Vanilla JS |

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Raja798990/WebsiteRestaurant.git
   cd WebsiteRestaurant/WebsiteRestaurant_API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `WebsiteRestaurant_API` directory:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/restaurant_db"
   JWT_SECRET="your-secure-secret-key-change-in-production"
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations (creates tables)
   npx prisma db push

   # Seed sample data (optional)
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

   Server runs at `http://localhost:3000`

### Default Admin Credentials (after seeding)

- **Email:** `admin@nabucco.com`
- **Password:** `admin123`
- **Role:** `superadmin`

## API Documentation

Base URL: `http://localhost:3000/api`

### Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

**Token lifetime:** 8 hours

**Roles:**
- `admin` - Standard admin access
- `superadmin` - Full access including admin management

### Endpoints Overview

#### Authentication & Admins

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admins/login` | No | Login, returns JWT token |
| GET | `/api/admins` | Superadmin | List all admins |
| POST | `/api/admins` | Superadmin | Create new admin |
| GET | `/api/admins/:id` | Admin | Get admin details |
| PUT | `/api/admins/:id` | Admin* | Update admin |
| PUT | `/api/admins/:id/password` | Admin* | Change password |
| DELETE | `/api/admins/:id` | Superadmin | Delete admin |

*Can only modify own account unless superadmin

#### Dashboard (All Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Overview metrics + today's schedule |
| GET | `/api/dashboard/stats` | 30-day statistics |
| GET | `/api/dashboard/weekly-reservations` | Next 7 days reservations |

#### Reservations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reservations` | No | List reservations (filter: `?date=&status=`) |
| GET | `/api/reservations/today` | No | Today's reservations |
| GET | `/api/reservations/:id` | No | Get single reservation |
| POST | `/api/reservations` | No | Create reservation (public booking) |
| PUT | `/api/reservations/:id` | No | Update reservation |
| PATCH | `/api/reservations/:id/status` | No | Update status only |
| DELETE | `/api/reservations/:id` | No | Delete reservation |

**Reservation statuses:** `pending`, `confirmed`, `declined`, `cancelled`

#### Menu

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu` | No | Get menu with categories and items |
| GET | `/api/menu/categories` | No | List categories |
| POST | `/api/menu/categories` | Admin | Create category |
| PUT | `/api/menu/categories/:id` | Admin | Update category |
| DELETE | `/api/menu/categories/:id` | Admin | Delete category |
| GET | `/api/menu/items` | No | List all items |
| POST | `/api/menu/items` | Admin | Create item |
| PUT | `/api/menu/items/:id` | Admin | Update item |
| DELETE | `/api/menu/items/:id` | Admin | Delete item |

#### Wines

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wines` | No | Get wines by category |
| GET | `/api/wines/categories` | No | List wine categories |
| POST | `/api/wines/categories` | Admin | Create category |
| GET | `/api/wines/items` | No | List all wines (detailed) |
| POST | `/api/wines/items` | Admin | Create wine |
| PUT | `/api/wines/items/:id` | Admin | Update wine |
| DELETE | `/api/wines/items/:id` | Admin | Delete wine |

**Wine pricing types:**
- **House wines:** glass, pitcher (25cl, 50cl, 1L)
- **Premium wines:** half-bottle (37.5cl), full bottle (75cl)

#### Specials

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/specials` | No | Get all specials |
| **Combos (Entree + Main - two prices)** |
| GET | `/api/specials/combos` | No | List combos |
| POST | `/api/specials/combos` | Admin | Create combo |
| PUT | `/api/specials/combos/:id` | Admin | Update combo |
| DELETE | `/api/specials/combos/:id` | Admin | Delete combo |
| **Mains (Single price)** |
| GET | `/api/specials/mains` | No | List main dishes |
| POST | `/api/specials/mains` | Admin | Create main |
| PUT | `/api/specials/mains/:id` | Admin | Update main |
| DELETE | `/api/specials/mains/:id` | Admin | Delete main |
| **Custom Items** |
| GET | `/api/specials/customs` | No | List custom items |
| POST | `/api/specials/customs` | Admin | Create custom |
| PUT | `/api/specials/customs/:id` | Admin | Update custom |
| DELETE | `/api/specials/customs/:id` | Admin | Delete custom |

#### Contact Requests & Banned Customers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/requests` | No | List contact requests |
| POST | `/api/requests` | No | Submit contact form (public) |
| GET | `/api/requests/:id` | No | Get single request |
| DELETE | `/api/requests/:id` | No | Delete request |
| GET | `/api/requests/banned/list` | Admin | List banned emails |
| POST | `/api/requests/banned` | Admin | Ban an email |
| DELETE | `/api/requests/banned/:id` | Admin | Unban email |

## Request/Response Examples

### Login
```bash
POST /api/admins/login
Content-Type: application/json

{
  "email": "admin@nabucco.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@nabucco.com",
    "role": "superadmin",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Create Reservation
```bash
POST /api/reservations
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "date": "2025-12-15",
  "time": "19:30",
  "adults": 4,
  "children": 2,
  "specialRemarks": "Birthday celebration, window seat preferred"
}
```

Response:
```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "date": "2025-12-15",
    "time": "19:30",
    "adults": 4,
    "children": 2,
    "specialRemarks": "Birthday celebration, window seat preferred",
    "status": "pending",
    "createdAt": "2025-11-21T10:00:00.000Z"
  }
}
```

### Get Dashboard Overview
```bash
GET /api/dashboard
Authorization: Bearer <token>
```

Response:
```json
{
  "metrics": {
    "todayReservationsCount": 5,
    "todayGuestCount": 18,
    "pendingReservationsCount": 3,
    "confirmedTodayCount": 4,
    "totalMenuItems": 45,
    "totalReservationsAllTime": 150,
    "recentRequestsCount": 2
  },
  "todaySchedule": [...],
  "recentRequests": [...]
}
```

## Database Schema

### Models

- **Admin** - User accounts with roles
- **Reservation** - Table bookings with status tracking
- **MenuCategory** - Menu sections with ordering
- **MenuItem** - Dishes with prices
- **WineCategory** - Wine sections
- **Wine** - Wines with flexible pricing
- **SpecialCombo** - Two-price specials (entree + main)
- **SpecialMain** - Single-price main dishes
- **SpecialCustom** - Flexible special items
- **Request** - Contact form submissions
- **BannedCustomer** - Email blocklist

## Postman Collection

A complete Postman collection is provided for API testing:

1. Import `postman/WebsiteRestaurant_API.postman_collection.json`
2. Import `postman/WebsiteRestaurant_API.postman_environment.json`
3. Update `adminEmail` and `adminPassword` in environment
4. Run "Login (set adminToken)" - JWT is auto-stored
5. Test any endpoint - token is auto-injected for protected routes

## Scripts

```bash
npm start      # Start production server
npm run dev    # Start with nodemon (auto-reload)
npm run seed   # Seed database with sample data
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | `dev-secret-change-me` |
| `PORT` | Server port | `3000` |

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

## Features

### Customer Features
- View menu, wines, and daily specials
- Make table reservations
- Submit contact requests
- Banned email validation

### Admin Features
- Secure JWT authentication
- Dashboard with real-time metrics
- Full CRUD for all content
- Reservation management with status updates
- Customer banning system
- Analytics (30-day stats, top customers)

## Author

**Gurdeep Gursimransingh**
Thomas More University - Data Science, Protection & Security (DSPS)
Belgium

## License

ISC
