# WebsiteRestaurant API

RESTful API backend for the Restaurant Management Platform.

> See the [main README](../README.md) for complete documentation including all endpoints, request/response examples, and setup instructions.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma db push

# Seed sample data (optional)
npm run seed

# Start server
npm run dev
```

Server runs at `http://localhost:3000`

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="mysql://user:password@localhost:3306/restaurant_db"
JWT_SECRET="your-secure-secret-key"
PORT=3000
```

## API Routes

| Resource | Base Path | Description |
|----------|-----------|-------------|
| Admins | `/api/admins` | Authentication & user management |
| Dashboard | `/api/dashboard` | Analytics & metrics (protected) |
| Reservations | `/api/reservations` | Table bookings |
| Menu | `/api/menu` | Categories & items |
| Wines | `/api/wines` | Wine catalog |
| Specials | `/api/specials` | Daily specials |
| Requests | `/api/requests` | Contact forms & bans |

## Default Admin (after seeding)

- **Email:** `admin@nabucco.com`
- **Password:** `admin123`

## Scripts

```bash
npm start      # Production server
npm run dev    # Development with auto-reload
npm run seed   # Seed sample data
```

## Postman Collection

Import the files from `postman/` directory for complete API testing:

1. `WebsiteRestaurant_API.postman_collection.json` - All endpoints
2. `WebsiteRestaurant_API.postman_environment.json` - Environment variables

Run the "Login" request first to auto-populate the auth token.

## Tech Stack

- Node.js + Express.js 5.1
- Prisma ORM + MySQL
- JWT Authentication
- bcrypt Password Hashing
