# *HagzNow Backend*

HagzNow is a comprehensive sports arena reservation platform built with *NestJS*. This backend API manages the entire lifecycle of booking sports venues, including user management, arena listings, real-time slot availability, wallet-based payments, and automated reservation settlements.

## *🚀 Features*

* *Authentication & Authorization*:  
  * Secure signup/login using JWT and Bcrypt.  
  * Role-Based Access Control (RBAC) with Guards: *Admin, **Owner, and **User*.  
* *Arena Management*:  
  * Owners can create and manage arenas with details like pricing, opening hours, and policies.  
  * Support for arena locations (geolocation), images, and extra services (e.g., ball rental).  
  * Slot management system to prevent double bookings.  
* *Reservation System*:  
  * *Hold & Settle Mechanism*: Reservations start in a "HOLD" state and are confirmed or canceled via a background queue.  
  * *Automated Settlement: Uses **BullMQ (Redis)* to automatically settle reservations after a specific time or handle timeouts.  
  * Validation for slot availability and user balance.  
* *Wallet & Payments*:  
  * Built-in wallet system for every user.  
  * Integration with *Paymob* for adding funds (Deposit).  
  * Transaction history tracking (Deposits, Payments, Refunds, Fees).  
  * Admin fee deduction and owner payout calculation.  
* *Search & Discovery*:  
  * Filter arenas by category, name, and pagination support.  
* *Dashboard*:  
  * Dedicated endpoints for Arena Owners to view stats (Occupancy rate, Earnings, Top arenas).

## *🛠 Tech Stack*

* *Framework*: [NestJS](https://nestjs.com/) (Node.js)  
* *Language*: TypeScript  
* *Database*: PostgreSQL  
* *ORM*: TypeORM  
* *Queue/Background Jobs*: BullMQ \+ Redis  
* *Payments*: Paymob Integration  
* *Documentation*: Swagger / OpenAPI  
* *File Uploads*: Multer (Custom integration with Sersawy CDN)

## *🏗 Architecture & Modules*

The application is structured into modular components:

| Module | Description |
| :---- | :---- |
| *Auth* | Handles JWT issuance, login, registration, and password changes. |
| *Users* | User profile management and administrative user controls. |
| *Arenas* | Core logic for creating venues, managing slots, extras, and images. |
| *Reservations* | Booking workflow, validation, and queue producers for settlement. |
| *Wallets* | Manages user balances, creates transactions, and handles Paymob webhooks. |
| *Categories* | Classification of arenas (e.g., Football, Tennis, Padel). |
| *Owners* | Aggregated data and insights for arena owners. |
| *Admin* | System-wide statistics and user status toggling. |

## *⚙ Installation & Setup*

### *Prerequisites*

* Node.js (v18+)  
* PostgreSQL  
* Redis (Required for BullMQ)

### *1\. Clone the repository*

git clone \[https://github.com/hagznow/hagznow-backend.git\](https://github.com/hagznow/hagznow-backend.git)  
cd hagznow-backend

### *2\. Install dependencies*

npm install

### *3\. Environment Configuration*

Create a .env file in the root directory and configure the following variables:

\# App  
PORT=3000

\# Database (PostgreSQL)  
DB\_HOST=localhost  
DB\_PORT=5432  
DB\_USERNAME=postgres  
DB\_PASSWORD=yourpassword  
DB\_NAME=hagznow  
DB\_SYNC=true \# Set to false in production

\# Redis (BullMQ)  
REDIS\_HOST=localhost  
REDIS\_PORT=6379  
\# REDIS\_USERNAME= (optional)  
\# REDIS\_PASSWORD= (optional)  
BULL\_PREFIX=arena

\# JWT Authentication  
JWT\_SECRET=your\_super\_secret\_key  
JWT\_EXPIRESIN=1d

\# Paymob Integration  
PAYMOB\_API\_KEY=your\_api\_key  
PAYMOB\_INTEGRATION\_ID=your\_integration\_id  
PAYMOB\_IFRAME\_ID=your\_iframe\_id  
PAYMOB\_HMAC\_SECRET=your\_hmac\_secret

\# Admin & Fees configuration  
ADMIN\_WALLET\_ID=uuid-of-admin-wallet  
ADMIN\_ID=uuid-of-admin-user  
ADMIN\_FEE\_RATE=0.1 \# 10% fee

### *4\. Run the application*

\# Development mode  
npm run start:dev

\# Production mode  
npm run start:prod

## *🔌 API Documentation*

Once the application is running, you can access the full interactive API documentation via Swagger UI:

* *URL*: http://localhost:3000/api or http://localhost:3000/swagger

## *🔄 Queue Processing*

This backend relies on *Redis* to handle reservation settlements asynchronously. Ensure your Redis instance is running. The SettlementsProcessor handles the logic for confirming transactions and transferring funds from the user's hold balance to the owner's wallet after the reservation is confirmed.
