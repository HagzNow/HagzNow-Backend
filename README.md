# HagzNow Backend

> A comprehensive sports arena reservation platform built with NestJS. This backend API manages the entire lifecycle of booking sports venues, including user management, arena listings, real-time slot availability, wallet-based payments, and automated reservation settlements.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture & Modules](#architecture--modules)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Common Patterns & Utilities](#common-patterns--utilities)
- [Queue Processing](#queue-processing)
- [Payment Integration](#payment-integration)
- [File Upload](#file-upload)

---

## 🎯 Overview

HagzNow is a full-featured backend system for managing sports arena reservations. It provides:

- **Multi-role User System**: Admin, Owner, and User roles with role-based access control
- **Arena Management**: Complete CRUD operations for sports venues with location, images, and extras
- **Reservation System**: Hold & settle mechanism with automated background processing
- **Wallet System**: Built-in wallet with transaction history and payment processing
- **Payment Gateway**: Paymob integration for deposits and payments
- **Review System**: User reviews and ratings for arenas
- **Dashboard Analytics**: Statistics and insights for owners and admins

---

## 🚀 Features

### Authentication & Authorization

- ✅ Secure signup/login using JWT tokens
- ✅ Password hashing with Bcrypt
- ✅ Role-Based Access Control (RBAC) with Guards
- ✅ Three user roles: **Admin**, **Owner**, and **User**
- ✅ Current user middleware for request context
- ✅ Protected routes with authentication guards

### Arena Management

- ✅ Owners can create and manage arenas
- ✅ Arena details: pricing, opening/closing hours, policies
- ✅ Geolocation support with ArenaLocation entity
- ✅ Multiple images per arena with ArenaImage entity
- ✅ Extra services (e.g., ball rental, equipment)
- ✅ Slot management system to prevent double bookings
- ✅ Arena status workflow (PENDING, APPROVED, REJECTED)
- ✅ Category-based classification

### Reservation System

- ✅ **Hold & Settle Mechanism**: Reservations start in "HOLD" state
- ✅ Automated settlement via background queue (BullMQ)
- ✅ Slot availability validation
- ✅ User balance validation before booking
- ✅ Deposit calculation based on arena settings
- ✅ Reservation status tracking (HOLD, CONFIRMED, CANCELLED, COMPLETED)
- ✅ Calendar view support for reservations

### Wallet & Payments

- ✅ Built-in wallet system for every user
- ✅ Integration with **Paymob** payment gateway
- ✅ Transaction history tracking
- ✅ Transaction types: Deposits, Payments, Refunds, Fees
- ✅ Admin fee deduction (configurable percentage)
- ✅ Owner payout calculation
- ✅ Wallet balance management
- ✅ Hold balance for pending reservations

### Search & Discovery

- ✅ Filter arenas by category, name, location
- ✅ Pagination support
- ✅ Sorting capabilities
- ✅ Arena status filtering

### Dashboard & Analytics

- ✅ Owner dashboard with statistics
- ✅ Occupancy rate calculations
- ✅ Earnings tracking
- ✅ Top arenas analytics
- ✅ Admin system-wide statistics
- ✅ User management and status toggling

### Reviews & Ratings

- ✅ User reviews for arenas
- ✅ Rating system
- ✅ Review management (create, update, delete)

---

## 🛠 Technology Stack

### Core Framework & Language

- **[NestJS](https://nestjs.com/)** v11.0.1 - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** v5.7.3 - Typed JavaScript
- **[Node.js](https://nodejs.org/)** - JavaScript runtime

### Database & ORM

- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[TypeORM](https://typeorm.io/)** v0.3.27 - Object-Relational Mapping
- **[pg](https://www.npmjs.com/package/pg)** v8.16.3 - PostgreSQL client
- **[pg-query-stream](https://www.npmjs.com/package/pg-query-stream)** v4.10.3 - Streaming queries

### Authentication & Security

- **[@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)** v11.0.1 - JWT implementation
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** v6.0.0 - Password hashing
- **[class-validator](https://www.npmjs.com/package/class-validator)** v0.14.2 - DTO validation
- **[class-transformer](https://www.npmjs.com/package/class-transformer)** v0.5.1 - Object transformation

### Queue & Background Jobs

- **[BullMQ](https://www.npmjs.com/package/bullmq)** v5.63.0 - Job queue
- **[@nestjs/bullmq](https://www.npmjs.com/package/@nestjs/bullmq)** v11.0.4 - BullMQ NestJS integration
- **[ioredis](https://www.npmjs.com/package/ioredis)** v5.8.2 - Redis client
- **[Redis](https://redis.io/)** - In-memory data store

### API Documentation

- **[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)** v11.2.1 - OpenAPI/Swagger documentation
- **Swagger UI** - Interactive API documentation

### HTTP & Middleware

- **[@nestjs/platform-express](https://www.npmjs.com/package/@nestjs/platform-express)** v11.1.7 - Express adapter
- **[morgan](https://www.npmjs.com/package/morgan)** v1.10.1 - HTTP request logger
- **[axios](https://www.npmjs.com/package/axios)** v1.13.1 - HTTP client

### File Upload

- **[multer](https://www.npmjs.com/package/multer)** v2.0.2 - File upload middleware
- **Sersawy CDN** - Custom image upload integration

### Event System

- **[@nestjs/event-emitter](https://www.npmjs.com/package/@nestjs/event-emitter)** v3.0.1 - Event-driven architecture

### Configuration

- **[@nestjs/config](https://www.npmjs.com/package/@nestjs/config)** v4.0.2 - Configuration management

### Development Tools

- **[ESLint](https://eslint.org/)** v9.18.0 - Code linting
- **[Prettier](https://prettier.io/)** v3.4.2 - Code formatting
- **[Jest](https://jestjs.io/)** v30.0.0 - Testing framework
- **[ts-jest](https://www.npmjs.com/package/ts-jest)** v29.2.5 - TypeScript Jest transformer
- **[Supertest](https://www.npmjs.com/package/supertest)** v7.0.0 - HTTP assertion library

---

## 📁 Project Structure

```
HagzNow-Backend/
├── dist/                          # Compiled JavaScript output
├── src/                           # Source code
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root application module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   │
│   ├── common/                    # Shared utilities and patterns
│   │   ├── decorators/            # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── use-image-upload.decorator.ts
│   │   ├── dtos/                  # Common DTOs
│   │   │   ├── pagination.dto.ts
│   │   │   └── sort.dto.ts
│   │   ├── filters/               # Exception filters
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/                # Authentication & authorization guards
│   │   │   ├── auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/          # Response interceptors
│   │   │   ├── response.interceptor.ts
│   │   │   └── serialize.interceptor.ts
│   │   ├── interfaces/            # TypeScript interfaces
│   │   │   ├── api-response.interface.ts
│   │   │   └── paginated-result.interface.ts
│   │   └── utils/                 # Utility functions
│   │       ├── api-response.util.ts
│   │       ├── filter.utils.ts
│   │       ├── handle-image-upload.util.ts
│   │       ├── paginate.ts
│   │       ├── sort.util.ts
│   │       └── upload-to-sersawy.util.ts
│   │
│   └── modules/                   # Feature modules
│       ├── admin/                 # Admin management
│       │   ├── admin.controller.ts
│       │   ├── admin.service.ts
│       │   └── admin.module.ts
│       │
│       ├── arenas/                # Arena management
│       │   ├── arenas.controller.ts
│       │   ├── arenas.service.ts
│       │   ├── arenas.module.ts
│       │   ├── arena-slots.controller.ts
│       │   ├── arena-slots.service.ts
│       │   ├── dto/               # Arena DTOs
│       │   │   ├── arena/
│       │   │   ├── arena-extra/
│       │   │   ├── arena-image/
│       │   │   ├── arena-location/
│       │   │   └── arena-slot/
│       │   ├── entities/         # Arena entities
│       │   │   ├── arena.entity.ts
│       │   │   ├── arena-extra.entity.ts
│       │   │   ├── arena-image.entity.ts
│       │   │   ├── arena-location.entity.ts
│       │   │   └── arena-slot.entity.ts
│       │   └── interfaces/
│       │       └── arena-status.interface.ts
│       │
│       ├── auth/                  # Authentication
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.module.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── change-password.dto.ts
│       │
│       ├── categories/            # Category management
│       │   ├── categories.controller.ts
│       │   ├── categories.service.ts
│       │   ├── categories.module.ts
│       │   ├── dto/
│       │   └── entities/
│       │       └── category.entity.ts
│       │
│       ├── chat/                  # Chat functionality (in development)
│       │   ├── dto/
│       │   └── entities/
│       │
│       ├── owners/                # Owner dashboard
│       │   ├── owners.controller.ts
│       │   ├── owners.service.ts
│       │   └── owners.module.ts
│       │
│       ├── reservations/          # Reservation system
│       │   ├── reservations.controller.ts
│       │   ├── reservations.service.ts
│       │   ├── reservations.module.ts
│       │   ├── dto/
│       │   ├── entities/
│       │   │   └── reservation.entity.ts
│       │   ├── interfaces/
│       │   │   ├── payment-methods.interface.ts
│       │   │   └── reservation-status.interface.ts
│       │   └── queue/             # BullMQ queue configuration
│       │       ├── bull.config.ts
│       │       ├── reservations.producer.ts
│       │       └── settlements.processor.ts
│       │
│       ├── reviews/               # Review system
│       │   ├── reviews.controller.ts
│       │   ├── reviews.service.ts
│       │   ├── reviews.module.ts
│       │   ├── dto/
│       │   └── entities/
│       │       └── review.entity.ts
│       │
│       ├── users/                 # User management
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.module.ts
│       │   ├── dto/
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   ├── interfaces/
│       │   │   ├── payout-method.interface.ts
│       │   │   ├── userRole.interface.ts
│       │   │   └── userStatus.interface.ts
│       │   └── middlewares/
│       │       └── current-user.middleware.ts
│       │
│       └── wallets/               # Wallet & payment system
│           ├── wallets.controller.ts
│           ├── wallets.service.ts
│           ├── wallets.module.ts
│           ├── wallets.listener.ts
│           ├── paymob.controller.ts
│           ├── paymob.service.ts
│           ├── wallet-transaction.controller.ts
│           ├── wallet-transaction.service.ts
│           ├── dto/
│           ├── entities/
│           │   ├── wallet.entity.ts
│           │   └── wallet-transaction.entity.ts
│           └── interfaces/
│               ├── transaction-stage.interface.ts
│               └── transaction-type.interface.ts
│
├── test/                          # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .gitignore                     # Git ignore rules
├── eslint.config.mjs              # ESLint configuration
├── nest-cli.json                  # NestJS CLI configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.build.json            # TypeScript build configuration
└── README.md                      # This file
```

---

## 🏗 Architecture & Modules

The application follows NestJS modular architecture with clear separation of concerns:

### Module Overview

| Module           | Description                    | Key Features                                                  |
| ---------------- | ------------------------------ | ------------------------------------------------------------- |
| **Auth**         | Authentication & authorization | JWT token generation, login, registration, password change    |
| **Users**        | User profile management        | User CRUD, role management, status toggling, profile updates  |
| **Arenas**       | Arena/venue management         | Create/update arenas, manage slots, images, locations, extras |
| **ArenaSlots**   | Time slot management           | Slot creation, availability checking, conflict prevention     |
| **Reservations** | Booking system                 | Hold & settle mechanism, queue processing, validation         |
| **Wallets**      | Wallet & payment system        | Balance management, transactions, Paymob integration          |
| **Categories**   | Arena categorization           | Category CRUD, arena classification                           |
| **Reviews**      | Review & rating system         | User reviews, ratings, review management                      |
| **Owners**       | Owner dashboard                | Statistics, analytics, earnings, occupancy rates              |
| **Admin**        | Admin panel                    | System-wide stats, user management, arena approval            |

### Common Module Structure

Each feature module typically contains:

- **Controller**: Handles HTTP requests and responses
- **Service**: Business logic and data access
- **Module**: Module configuration and dependencies
- **DTOs**: Data Transfer Objects for validation
- **Entities**: TypeORM database entities
- **Interfaces**: TypeScript type definitions

---

## 🗄 Database Schema

### Core Entities

#### User Entity

- `id` (UUID, Primary Key)
- `fName`, `lName` (string)
- `email` (unique), `phone` (string)
- `password` (hashed with bcrypt)
- `role` (enum: USER, OWNER, ADMIN)
- `status` (enum: ACTIVE, INACTIVE, SUSPENDED)
- `payoutMethod` (enum: WALLET, BANK_TRANSFER)
- `avatar`, `nationalIdFront`, `nationalIdBack`, `selfieWithId` (optional)
- `createdAt`, `updatedAt` (timestamps)
- **Relations**: One-to-One with Wallet, One-to-Many with Reservations, Arenas, Reviews, Transactions

#### Arena Entity

- `id` (UUID, Primary Key)
- `name` (string)
- `thumbnail` (string)
- `minPeriod` (number, minutes)
- `openingHour`, `closingHour` (number)
- `pricePerHour` (decimal)
- `depositPercent` (decimal, default 100)
- `description`, `policy` (text, optional)
- `status` (enum: PENDING, APPROVED, REJECTED)
- `ownerId` (Foreign Key to User)
- `categoryId` (Foreign Key to Category)
- **Relations**: One-to-One with Location, One-to-Many with Images, Extras, Slots, Reservations, Reviews

#### ArenaLocation Entity

- `id` (UUID, Primary Key)
- `latitude`, `longitude` (decimal)
- `address` (string)
- `city`, `country` (string, optional)
- `arenaId` (Foreign Key to Arena)

#### ArenaImage Entity

- `id` (UUID, Primary Key)
- `url` (string)
- `arenaId` (Foreign Key to Arena)

#### ArenaExtra Entity

- `id` (UUID, Primary Key)
- `name` (string)
- `price` (decimal)
- `arenaId` (Foreign Key to Arena)

#### ArenaSlot Entity

- `id` (UUID, Primary Key)
- `startTime`, `endTime` (timestamp)
- `isAvailable` (boolean)
- `arenaId` (Foreign Key to Arena)

#### Reservation Entity

- `id` (UUID, Primary Key)
- `startTime`, `endTime` (timestamp)
- `totalHours` (number)
- `totalAmount` (decimal)
- `depositAmount` (decimal)
- `status` (enum: HOLD, CONFIRMED, CANCELLED, COMPLETED)
- `paymentMethod` (enum: WALLET, CASH)
- `userId` (Foreign Key to User)
- `arenaId` (Foreign Key to Arena)
- `createdAt`, `updatedAt` (timestamps)

#### Wallet Entity

- `id` (UUID, Primary Key)
- `balance` (decimal, default 0)
- `holdBalance` (decimal, default 0)
- `userId` (Foreign Key to User, unique)

#### WalletTransaction Entity

- `id` (UUID, Primary Key)
- `amount` (decimal)
- `type` (enum: DEPOSIT, PAYMENT, REFUND, FEE)
- `stage` (enum: PENDING, COMPLETED, FAILED)
- `description` (string, optional)
- `userId` (Foreign Key to User)
- `walletId` (Foreign Key to Wallet)
- `reservationId` (Foreign Key to Reservation, optional)
- `createdAt` (timestamp)

#### Category Entity

- `id` (UUID, Primary Key)
- `name` (string, unique)
- `description` (text, optional)
- `icon` (string, optional)

#### Review Entity

- `id` (UUID, Primary Key)
- `rating` (number, 1-5)
- `comment` (text, optional)
- `userId` (Foreign Key to User)
- `arenaId` (Foreign Key to Arena)
- `createdAt`, `updatedAt` (timestamps)

---

## ⚙ Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v12 or higher
- **Redis** v6 or higher (required for BullMQ)
- **npm** or **yarn** package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/hagznow/hagznow-backend.git
cd hagznow-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=hagznow
DB_SYNC=true  # Set to false in production

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=  # Optional
REDIS_PASSWORD=  # Optional
BULL_PREFIX=arena

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRESIN=1d

# Paymob Payment Gateway
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_paymob_integration_id
PAYMOB_IFRAME_ID=your_paymob_iframe_id
PAYMOB_HMAC_SECRET=your_paymob_hmac_secret

# Admin Configuration
ADMIN_WALLET_ID=uuid-of-admin-wallet
ADMIN_ID=uuid-of-admin-user
ADMIN_FEE_RATE=0.1  # 10% admin fee
```

### Step 4: Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE hagznow;
```

2. The application will automatically create tables if `DB_SYNC=true` (development only)

**⚠️ Warning**: Never set `DB_SYNC=true` in production. Use migrations instead.

### Step 5: Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or using local Redis installation
redis-server
```

### Step 6: Run the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3000`

---

## 🔌 API Documentation

### Swagger UI

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api
- **Alternative URL**: http://localhost:3000/swagger
- **JSON Schema**: http://localhost:3000/swagger/json

### API Endpoints Overview

#### Authentication (`/auth`)

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change password (authenticated)

#### Users (`/users`)

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

#### Arenas (`/arenas`)

- `GET /arenas` - List all arenas (with filters)
- `GET /arenas/:id` - Get arena details
- `POST /arenas` - Create arena (Owner only)
- `PATCH /arenas/:id` - Update arena (Owner only)
- `PATCH /arenas/:id/status` - Update arena status (Admin only)

#### Arena Slots (`/arena-slots`)

- `GET /arena-slots` - Get available slots
- `POST /arena-slots` - Create slot (Owner only)
- `PATCH /arena-slots/:id` - Update slot (Owner only)
- `DELETE /arena-slots/:id` - Delete slot (Owner only)

#### Reservations (`/reservations`)

- `GET /reservations` - List reservations (with filters)
- `GET /reservations/:id` - Get reservation details
- `POST /reservations` - Create reservation (User)
- `PATCH /reservations/:id` - Update reservation
- `DELETE /reservations/:id` - Cancel reservation

#### Wallets (`/wallets`)

- `GET /wallets` - Get user wallet
- `GET /wallets/transactions` - Get transaction history
- `POST /wallets/deposit` - Initiate deposit (Paymob)

#### Paymob (`/paymob`)

- `POST /paymob/webhook` - Paymob webhook handler

#### Categories (`/categories`)

- `GET /categories` - List all categories
- `GET /categories/:id` - Get category
- `POST /categories` - Create category (Admin only)
- `PATCH /categories/:id` - Update category (Admin only)
- `DELETE /categories/:id` - Delete category (Admin only)

#### Reviews (`/reviews`)

- `GET /reviews` - List reviews
- `GET /reviews/:id` - Get review
- `POST /reviews` - Create review (User)
- `PATCH /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

#### Owners (`/owners`)

- `GET /owners/dashboard` - Owner dashboard statistics
- `GET /owners/statistics` - Detailed owner statistics

#### Admin (`/admin`)

- `GET /admin/statistics` - System-wide statistics
- `PATCH /admin/users/:id/status` - Toggle user status

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start in development mode with watch
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build the application
npm run start:prod     # Start in production mode

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Code Style

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** strict mode (with some relaxed rules)

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Run linter: `npm run lint`
4. Run tests: `npm run test`
5. Commit your changes
6. Create a pull request

---

## 🧪 Testing

### Unit Tests

Unit tests are located alongside source files with `.spec.ts` extension:

```bash
npm run test
```

### E2E Tests

End-to-end tests are located in the `test/` directory:

```bash
npm run test:e2e
```

### Test Coverage

Generate test coverage report:

```bash
npm run test:cov
```

---

## 🔧 Common Patterns & Utilities

### Response Interceptor

All API responses are automatically wrapped in a standardized format:

```typescript
{
  success: true,
  data: { ... },
  message: "Success"
}
```

### Exception Filter

Global exception filter catches all errors and returns standardized error responses:

```typescript
{
  success: false,
  message: "Error message",
  code: "ERROR_CODE"
}
```

### Pagination

Pagination is handled via DTOs:

```typescript
class PaginationDto {
  page?: number;
  limit?: number;
}
```

### Sorting

Sorting is supported via DTOs:

```typescript
class SortDto {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

### Authentication Decorator

Use `@CurrentUser()` decorator to get the current authenticated user:

```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Role Decorator

Use `@Roles()` decorator to restrict access:

```typescript
@Roles(UserRole.ADMIN)
@Get('admin-only')
adminOnly() {
  // ...
}
```

### Image Upload Decorator

Use `@UseImageUpload()` decorator for file uploads:

```typescript
@Post('upload')
@UseImageUpload()
async upload(@UploadedFiles() files: Express.Multer.File[]) {
  // Files are automatically uploaded to Sersawy CDN
}
```

---

## 🔄 Queue Processing

### BullMQ Configuration

The application uses BullMQ for background job processing, specifically for reservation settlements.

### Queue Setup

- **Queue Name**: `reservations`
- **Processor**: `SettlementsProcessor`
- **Connection**: Redis (configured via environment variables)

### Reservation Settlement Flow

1. User creates a reservation → Status: `HOLD`
2. Funds are held in user's wallet (`holdBalance`)
3. Job is queued for settlement
4. After timeout or confirmation:
   - Funds are transferred from `holdBalance` to owner's wallet
   - Admin fee is deducted
   - Reservation status changes to `CONFIRMED` or `CANCELLED`

### Queue Configuration

Located in `src/modules/reservations/queue/bull.config.ts`:

- **Attempts**: 5 retries
- **Backoff**: Exponential (1000ms delay)
- **Remove on Complete**: 1000 jobs
- **Remove on Fail**: Keep failed jobs

### Starting Queue Workers

Queue workers start automatically with the application. Ensure Redis is running.

---

## 💳 Payment Integration

### Paymob Integration

The application integrates with Paymob payment gateway for deposits.

#### Features

- **Deposit Initiation**: Users can add funds to their wallet
- **Webhook Handling**: Paymob webhooks are processed automatically
- **Transaction Tracking**: All payment transactions are recorded

#### Paymob Configuration

Configure Paymob credentials in `.env`:

```env
PAYMOB_API_KEY=your_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

#### Payment Flow

1. User initiates deposit via `/wallets/deposit`
2. Paymob payment link is generated
3. User completes payment on Paymob
4. Paymob sends webhook to `/paymob/webhook`
5. Wallet balance is updated
6. Transaction is recorded

### Admin Fee System

- Configurable admin fee rate (default: 10%)
- Fee is deducted from reservation payments
- Fee is transferred to admin wallet
- Owner receives: `totalAmount * (1 - ADMIN_FEE_RATE)`

---

## 📤 File Upload

### Image Upload System

The application uses **Sersawy CDN** for image storage.

#### Upload Flow

1. Files are received via Multer middleware
2. Files are uploaded to Sersawy CDN via `uploadToSersawy()` utility
3. CDN URLs are returned and stored in database

#### Supported Upload Endpoints

- Arena images
- User avatars
- National ID documents
- Selfie with ID

#### Upload Decorator

Use `@UseImageUpload()` decorator to automatically handle uploads:

```typescript
@Post('upload')
@UseImageUpload()
async upload(@UploadedFiles() files: Express.Multer.File[]) {
  // Files are automatically uploaded to Sersawy
  return files;
}
```

### Static Assets

Static assets are served from `/uploads/` directory:

```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

---

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Guards for route protection
- **Input Validation**: class-validator for DTO validation
- **CORS**: Enabled for cross-origin requests
- **Exception Filtering**: Global error handling
- **Request Logging**: Morgan HTTP logger

---

## 📝 License

This project is private and unlicensed.

---

## 👥 Contributing

This is a private project. For contributions, please contact the project maintainers.

---

## 📞 Support

For issues and questions, please contact the development team.

---

## 🎯 Future Enhancements

- [ ] Chat module implementation
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app API optimizations
- [ ] Rate limiting
- [ ] API versioning
- [ ] GraphQL support

---

**Built with ❤️ using NestJS**
