# ElectroMart - Admin Backend

This repository contains the Admin backend for ElectroMart (MERN stack). This phase focuses on Admin Authentication and backend foundation.

## Quick Start

1. Copy `.env.example` to `.env` and set values (e.g., PORT, MONGO_URI, JWT_SECRET)
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`

## What we implemented in this step
- Project initialization with recommended dev tooling (ESLint, Prettier, nodemon)
- Basic Express server with health endpoint
- DB connection placeholder
- Project structure scaffold (src/, config/, routes/, scripts/)

Next step (awaiting your confirmation): Create Express server routes, connect to MongoDB, and add the Admin Mongoose model and auth routes.

## Admin Auth APIs (manual testing)

1) Login
- Endpoint: `POST /api/v1/admin/login`
- Headers: `Content-Type: application/json`
- Body (example):
  {
    "email": "admin@example.com",
    "password": "ChangeMe123!"
  }
- Success (200):
  {
    "token": "<jwt-token>",
    "admin": { "id": "<id>", "email": "admin@example.com" }
  }
- Errors:
  - 400: { "error": "Email and password are required" }
  - 401: { "error": "Invalid credentials" }

2) Get current admin
- Endpoint: `GET /api/v1/admin/me`
- Headers: `Authorization: Bearer <jwt-token>`
- Success (200):
  {
    "admin": { "_id": "<id>", "email": "admin@example.com", "createdAt": "..." }
  }
- Errors:
  - 401: { "error": "Missing Authorization header" }
  - 401: { "error": "Invalid or expired token" }
  - 401: { "error": "Invalid token: admin not found" }

3) Protected test route
- Endpoint: `GET /api/v1/admin/protected`
- Headers:
  - `Authorization: Bearer <jwt-token>`
- Success (200):
  {
    "ok": true,
    "message": "Protected route access granted",
    "admin": { "id": "<id>", "email": "admin@example.com" }
  }
- Errors: same as `/admin/me`

4) Admin Settings (protected)
- GET current settings
  - Endpoint: `GET /api/v1/admin/settings`
  - Headers:
    - `Authorization: Bearer <jwt-token>`
  - Success (200):
    {
      "settings": {
        "_id": "<id>",
        "siteTitle": "ElectroMart",
        "contactEmail": "admin@example.com",
        "supportEmail": "admin@example.com",
        "enableListings": true,
        "defaultListingDurationDays": 30
      }
    }
- PUT update settings
  - Endpoint: `PUT /api/v1/admin/settings`
  - Headers:
    - `Content-Type: application/json`
    - `Authorization: Bearer <jwt-token>`
  - Body (example):
    {
      "siteTitle": "ElectroMart Admin",
      "contactEmail": "support@electromart.example.com",
      "enableListings": false,
      "defaultListingDurationDays": 60
    }
  - Success (200):
    {
      "settings": { "_id": "<id>", "siteTitle": "ElectroMart Admin", ... }
    }

5) Vendor management (admin-only)
- List vendors
  - Endpoint: `GET /api/v1/admin/vendors`
  - Query params (optional): `status` (pending|approved|rejected|blocked), `page`, `limit`, `q` (search)
  - Headers:
    - `Authorization: Bearer <jwt-token>`
  - Success (200):
    {
      "vendors": [ { "_id": "<id>", "name": "Vendor A", "email": "v@a.com", "status": "pending" } ],
      "meta": { "total": 1, "page": 1, "limit": 20 }
    }
- Update vendor status (approve / reject / block)
  - Endpoint: `PUT /api/v1/admin/vendors/:id/status`
  - Headers:
    - `Content-Type: application/json`
    - `Authorization: Bearer <jwt-token>`
  - Body (example - approve):
    { "status": "approved" }
  - Body (example - reject):
    { "status": "rejected", "reason": "Missing documents" }
  - Success (200):
    { "vendor": { "_id": "<id>", "name": "Vendor A", "status": "approved" } }
  - Errors:
    - 400: { "error": "Invalid status" }
    - 404: { "error": "Vendor not found" }

6) Subscription Plans (admin-only)
- Create plan
  - Endpoint: `POST /api/v1/admin/plans`
  - Headers:
    - `Content-Type: application/json`
    - `Authorization: Bearer <jwt-token>`
  - Body (example):
    {
      "name": "Basic",
      "description": "Basic plan",
      "productLimit": 50,
      "durationDays": 30,
      "price": 9.99,
      "currency": "USD",
      "active": true
    }
  - Success (201):
    { "plan": { "_id": "<id>", "slug": "basic", "name": "Basic", "price": 9.99 } }

- List plans
  - Endpoint: `GET /api/v1/admin/plans`
  - Query params: `active`, `page`, `limit`, `q`
  - Headers:
    - `Authorization: Bearer <jwt-token>`
  - Success (200):
    {
      "plans": [ { "_id": "<id>", "name": "Free", "slug": "free", "price": 0 } ],
      "meta": { "total": 3, "page": 1, "limit": 20 }
    }

- Get plan
  - Endpoint: `GET /api/v1/admin/plans/:id`
  - Headers: `Authorization: Bearer <jwt-token>`
  - Success (200): { "plan": { ... } }

- Update plan
  - Endpoint: `PUT /api/v1/admin/plans/:id`
  - Body: any of name, description, productLimit, durationDays, price, currency, active
  - Success (200): { "plan": { ... } }

- Delete plan (soft-delete -> sets active=false)
  - Endpoint: `DELETE /api/v1/admin/plans/:id`
  - Success (200): { "plan": { "active": false } }

7) Vendor product creation enforcement (admin-proxied)
- Seed vendor & subscription (local testing)
  - Create a vendor (seed): `npm run seed-vendor` (creates `vendor@example.com` - approved)
  - Seed plans: `npm run seed-plans` (Free/Basic/Pro)
  - Create a subscription for the vendor: `npm run seed-vendor-subscriptions`

- Create product for vendor (enforced)
  - Endpoint: `POST /api/v1/admin/vendors/:vendorId/products`
  - Headers:
    - `Content-Type: application/json`
    - `Authorization: Bearer <jwt-token>`
  - Body (example):
    { "title": "My new product", "description": "..." }
  - Success (201): { "product": { "_id": "<id>", "vendor": "<vendorId>", "title": "My new product" } }
  - Limit exceeded (403):
    { "error": "Product limit exceeded", "limit": 5, "currentCount": 5 }
  - Vendor not approved (403): { "error": "Vendor is not approved" }

- List vendor products (for testing)
  - Endpoint: `GET /api/v1/admin/vendors/:vendorId/products`
  - Headers:
    - `Authorization: Bearer <jwt-token>`
  - Success (200): { "products": [ ... ], "total": 3 }

Notes:
- The helper `canVendorCreateProduct(vendorId)` returns `{ allowed, limit, currentCount, reason }` and is used by the product creation endpoint to enforce limits.
- If there is an active subscription for the vendor, the plan's `productLimit` applies; otherwise the `AdminSettings.freeProductLimit` is used (default 5).
- Vendors must be `approved` to create products and `blocked` vendors are blocked from creating products.

8) Vendor Signup & Email Verification (backend only)
- Vendor Signup
  - Endpoint: `POST /api/v1/vendor/signup`
  - Headers: `Content-Type: application/json`
  - Body (example):
    {
      "name": "Vendor One",
      "email": "vendor1@example.com",
      "phone": "9876543210",
      "description": "My vendor",
      "password": "SecurePass123!"
    }
  - Success (201): { "message": "Signup successful. Verify email with OTP sent to the provided email." }
  - Errors:
    - 400: { "error": "Name, email and password are required" }
    - 400: { "error": "Email already registered" }
    - 403: { "error": "This email is blocked from registering" }

- Verify Email
  - Endpoint: `POST /api/v1/vendor/verify-email`
  - Headers: `Content-Type: application/json`
  - Body (example):
    { "email": "vendor1@example.com", "otp": "123456" }
  - Success (200): { "message": "Email verified successfully" }
  - Errors:
    - 400: { "error": "Email and otp are required" }
    - 404: { "error": "Vendor not found" }
    - 400: { "error": "OTP expired" }
    - 400: { "error": "Invalid OTP" }

Notes:
- OTP is stored on the vendor record (expires in 10 minutes by default) and sent via console log for now (mocked email).

