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

8) Vendor Request & Email Verification (backend only)
- Submit Vendor Request
  - Endpoint: `POST /api/v1/vendor-requests`
  - Headers: `Content-Type: application/json`
  - Body (example):
    {
      "email": "vendor@example.com",
      "phone": "9876543210",
      "location": "Indore",
      "description": "Mobile & electronics shop",
      "category": "electronics"
    }
  - Success (201): { "message": "Vendor request submitted. Verify email with OTP." }
  - Notes: OTP printed to console in dev mode; request is created with `status: pending` and `emailVerified: false`.

- Verify Vendor Request Email (OTP)
  - Endpoint: `POST /api/v1/vendor-requests/verify-otp`
  - Headers: `Content-Type: application/json`
  - Body (example):
    { "email": "vendor@example.com", "otp": "123456" }
  - Success (200): { "message": "Email verified successfully" }
  - Errors:
    - 400: { "error": "Email and otp are required" }
    - 404: { "error": "Vendor request not found" }
    - 400: { "error": "OTP expired" }
    - 400: { "error": "Invalid OTP" }

Notes:
- Only verified requests appear in the admin review queue. OTP expires in `VENDOR_OTP_EXPIRES_MIN` minutes (default 10) and is printed to the console for development.

- Set Vendor Password (first time)
  - Endpoint: `POST /api/v1/vendor/set-password`
  - Body: { "email": "vendor@example.com", "password": "StrongPassword@123" }
  - Rules: Vendor must exist and be approved; password must not already be set.
  - Success (200): { "message": "Password set successfully" }

- Vendor Login
  - Endpoint: `POST /api/v1/vendor/login`
  - Body: { "email":"vendor@example.com", "password":"StrongPassword@123" }
  - Rules: Vendor must be approved and password must be set.
  - Success (200): { "token": "JWT_TOKEN" }
  - Returned token payload contains: { vendorId, role: "vendor" }

9) Vendor Profile (STEP-7C) — Backend only

- GET Vendor Profile
  - Endpoint: `GET /api/v1/vendor/profile`
  - Headers: `Authorization: Bearer <vendor-token>`
  - Success (200): { "vendor": { "_id": "<id>", "name": "V...", "email": "v@e.com", "profileImage": "/uploads/vendors/<file>", "shopImages": ["/uploads/vendors/<file>"], "profileCompleted": true } }
  - Errors: 401/403 where token invalid or vendor not approved/blocked

- UPDATE Vendor Profile (image upload)
  - Endpoint: `PUT /api/v1/vendor/profile`
  - Headers: `Authorization: Bearer <vendor-token>`
  - Content-Type: multipart/form-data
  - Fields (form-data):
    - `name` (string)
    - `description` (string)
    - `profileImage` (file, single, required to complete profile)
    - `shopImages` (file, multiple, optional)
  - Constraints:
    - Allowed types: `.jpg, .jpeg, .png, .webp`
    - Max file size: 2MB per file
  - Success (200): returns updated vendor object (excludes password & OTP fields)
  - Invalid file type (400): { "error": "Invalid file type" }
  - Large file (400): multer error returned, message will indicate file size
  - If required fields (name + description + profileImage) absent, `profileCompleted` remains false

Notes:
- Images are stored locally under `/uploads/vendors/` and served at `/uploads/vendors/<file>`.
- Only the vendor owner (from JWT) can update their profile. Admin tokens DO NOT work on vendor routes.
- Product creation will later enforce `vendor.profileCompleted === true` in addition to `approved` and `emailVerified`.

## User Auth APIs (STEP-8.5) — Simple, low-friction onboarding

Philosophy: Lead capture only, no email verification or OTP. Fast, simple signup & login.

1) User Signup
  - Endpoint: `POST /api/v1/users/signup`
  - Headers: `Content-Type: application/json`
  - Body (example):
    {
      "name": "Rahul Sharma",
      "email": "rahul@gmail.com",
      "password": "123456"
    }
  - Success (201):
    {
      "message": "Signup successful",
      "token": "<jwt-token>",
      "user": { "_id": "<id>", "name": "...", "email": "...", "phone": null, "profileImage": null, "address": {} }
    }
  - Errors:
    - 400: { "error": "Name, email, and password are required" }
    - 409: { "error": "Email already registered" }

Notes:
- No email verification or OTP.
- Password must be at least 6 characters.
- Email is automatically lowercased and must be unique.

2) User Login
  - Endpoint: `POST /api/v1/users/login`
  - Headers: `Content-Type: application/json`
  - Body (example):
    {
      "email": "rahul@gmail.com",
      "password": "123456"
    }
  - Success (200):
    {
      "message": "Login successful",
      "token": "<jwt-token>",
      "user": { "_id": "<id>", "name": "...", "email": "...", "phone": null, "profileImage": null, "address": {} }
    }
  - Errors:
    - 400: { "error": "Email and password are required" }
    - 401: { "error": "Invalid credentials" }

Notes:
- JWT token returned; use for subsequent authenticated requests.
- Token payload: { userId, role: "user" }

3) GET User Profile
  - Endpoint: `GET /api/v1/users/me`
  - Headers: `Authorization: Bearer <user-token>`
  - Success (200):
    {
      "user": { "_id": "<id>", "name": "...", "email": "...", "phone": "...", "profileImage": "/uploads/users/<file>", "address": { "line1": "...", "city": "...", "state": "...", "pincode": "..." } }
    }
  - Errors:
    - 401: { "error": "Missing Authorization header" }
    - 401: { "error": "Invalid token" }
    - 404: { "error": "User not found" }

Notes:
- Returns complete user profile including address.
- Password is never returned in API responses.

4) UPDATE User Profile
  - Endpoint: `PUT /api/v1/users/me`
  - Headers:
    - `Authorization: Bearer <user-token>`
    - `Content-Type: multipart/form-data`
  - Form fields (form-data):
    - `name` (string, optional)
    - `phone` (string, optional)
    - `addressLine1` (string, optional)
    - `city` (string, optional)
    - `state` (string, optional)
    - `pincode` (string, optional)
    - `profileImage` (file, single, optional)
  - Upload constraints:
    - Allowed types: `.jpg, .jpeg, .png, .webp`
    - Max file size: 2MB per file
  - Success (200): returns updated user object
  - Errors:
    - 401: { "error": "Missing Authorization header" }
    - 404: { "error": "User not found" }
    - 400: { "error": "Invalid file type" } or multer error for file size

Notes:
- Images are stored locally under `/uploads/users/` and served at `/uploads/users/<file>`.
- All fields are optional; only provided fields are updated.
- Address is stored as a single document with optional fields.
- Profile image is optional and can be updated independently of other fields.
- `lastActiveAt` is automatically updated on every authenticated request.
## Vendor Product APIs (STEP-8.6) — UPDATE & DELETE

Philosophy: Vendors can fully manage (create, read, update, delete) their own products. Strict ownership enforcement.

1) Create Product
  - Endpoint: `POST /api/v1/vendor/products`
  - Headers:
    - `Authorization: Bearer <vendor-token>`
    - `Content-Type: multipart/form-data`
  - Form fields:
    - `title` (required)
    - `description` (optional)
    - `category` (required, category ID)
    - `brand` (optional)
    - `model` (optional)
    - `price` (required, number)
    - `condition` (optional, new|used, default: used)
    - `usageDuration` (optional, e.g., "6 months")
    - `warrantyRemaining` (optional)
    - `invoiceAvailable` (optional, true|false)
    - `knownIssues` (optional, JSON string)
    - `specs` (optional, JSON string per CategoryFieldConfig)
    - `city` (optional)
    - `state` (optional)
    - `negotiable` (optional, true|false)
    - `productImages` (optional, up to 5 files)
    - `invoiceImage` (optional, single file)
  - Success (201): { "product": {...} }
  - Errors:
    - 400: Missing required fields or invalid specs JSON
    - 403: Vendor profile not complete

2) List Own Products
  - Endpoint: `GET /api/v1/vendor/products`
  - Headers: `Authorization: Bearer <vendor-token>`
  - Success (200): { "products": [...] }

3) Get Own Product
  - Endpoint: `GET /api/v1/vendor/products/:productId`
  - Headers: `Authorization: Bearer <vendor-token>`
  - Success (200): { "product": {...} }
  - Errors:
    - 403: Not authorized (product belongs to different vendor)
    - 404: Product not found

4) UPDATE Product (VENDOR)
  - Endpoint: `PUT /api/v1/vendor/products/:productId`
  - Headers:
    - `Authorization: Bearer <vendor-token>`
    - `Content-Type: multipart/form-data`
  - Updatable form fields (all optional):
    - `title`
    - `description`
    - `brand`
    - `model`
    - `price` (number)
    - `condition` (new|used)
    - `usageDuration`
    - `warrantyRemaining`
    - `invoiceAvailable` (true|false)
    - `knownIssues` (JSON string)
    - `specs` (JSON string, validated against CategoryFieldConfig)
    - `city`
    - `state`
    - `negotiable` (true|false)
    - `status` (active|inactive)
    - `productImages` (file, up to 5) → replaces existing images
    - `invoiceImage` (file, single) → replaces existing invoice
  - Success (200): { "product": {...updatedProduct} }
  - Errors:
    - 400: Invalid input (e.g., invalid specs JSON, unknown spec keys)
    - 403: Not authorized (vendor must be product owner)
    - 404: Product not found

Notes:
- Only the vendor who created the product can update it.
- Specs are validated against CategoryFieldConfig; unknown keys are rejected.
- Image uploads replace existing images (not appended).
- All fields are optional; only provided fields are updated.

5) DELETE Product (VENDOR)
  - Endpoint: `DELETE /api/v1/vendor/products/:productId`
  - Headers: `Authorization: Bearer <vendor-token>`
  - Success (200): { "message": "Product deleted successfully" }
  - Errors:
    - 403: Not authorized (vendor must be product owner)
    - 404: Product not found

Notes:
- Hard delete (permanent removal from database).
- Only the vendor who created the product can delete it.
- Admin cannot delete products via this endpoint (admin has separate moderation endpoints).