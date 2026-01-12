## 🧪 Vendor Product APIs - Complete Testing Guide

**Base URL:** `http://localhost:5000/api/v1`

### Prerequisites
- Vendor must be authenticated (JWT token)
- Vendor profile must be completed
- Category must exist in the system

---

## 1️⃣ CREATE PRODUCT

### POST `/vendor/products`
```http
POST /api/v1/vendor/products
Authorization: Bearer <vendor-token>
Content-Type: multipart/form-data

Form Fields:
- title: "iPhone 12 Pro"
- description: "Excellent condition, no scratches"
- category: "67a1c2e9f8b2c123456789ab"  (category ID)
- brand: "Apple"
- model: "iPhone 12 Pro"
- price: "45000"
- condition: "used"
- usageDuration: "1 year"
- warrantyRemaining: "6 months"
- invoiceAvailable: "true"
- knownIssues: "[]"
- specs: '{"color":"Space Gray","storage":"256GB"}'
- city: "Bangalore"
- state: "Karnataka"
- negotiable: "true"
- productImages: <file1.jpg> <file2.jpg> ... (max 5)
- invoiceImage: <invoice.pdf>
```

**Success Response (201):**
```json
{
  "product": {
    "_id": "67a1d5f8c9b3d234567890cd",
    "title": "iPhone 12 Pro",
    "description": "Excellent condition, no scratches",
    "category": { "_id": "67a1c2e9f8b2c123456789ab", "name": "Electronics" },
    "brand": "Apple",
    "model": "iPhone 12 Pro",
    "price": 45000,
    "condition": "used",
    "usageDuration": "1 year",
    "warrantyRemaining": "6 months",
    "invoiceAvailable": true,
    "knownIssues": [],
    "specs": { "color": "Space Gray", "storage": "256GB" },
    "productImages": ["/uploads/products/iphone-1673091600000.jpg", ...],
    "invoiceImage": "/uploads/products/invoice-1673091600000.pdf",
    "city": "Bangalore",
    "state": "Karnataka",
    "negotiable": true,
    "status": "active",
    "vendor": "67a1c0e7f8b2c123456789aa",
    "viewsCount": 0,
    "createdAt": "2026-01-13T10:30:00.000Z",
    "updatedAt": "2026-01-13T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// Missing required fields (400)
{ "error": "Title, category and price are required" }

// Invalid specs JSON (400)
{ "error": "Invalid specs JSON" }

// Unknown spec key (400)
{ "error": "Unsupported spec key: unknownField" }

// Profile not complete (403)
{ "error": "Complete vendor profile before adding products" }
```

---

## 2️⃣ LIST OWN PRODUCTS

### GET `/vendor/products`
```http
GET /api/v1/vendor/products
Authorization: Bearer <vendor-token>
```

**Success Response (200):**
```json
{
  "products": [
    {
      "_id": "67a1d5f8c9b3d234567890cd",
      "title": "iPhone 12 Pro",
      "price": 45000,
      "condition": "used",
      "city": "Bangalore",
      "status": "active",
      "vendor": "67a1c0e7f8b2c123456789aa",
      "viewsCount": 24,
      "category": { "_id": "...", "name": "Electronics" }
    },
    { ...more products... }
  ]
}
```

---

## 3️⃣ GET SINGLE PRODUCT

### GET `/vendor/products/:productId`
```http
GET /api/v1/vendor/products/67a1d5f8c9b3d234567890cd
Authorization: Bearer <vendor-token>
```

**Success Response (200):**
```json
{
  "product": {
    "_id": "67a1d5f8c9b3d234567890cd",
    "title": "iPhone 12 Pro",
    "description": "Excellent condition, no scratches",
    "category": { "_id": "67a1c2e9f8b2c123456789ab", "name": "Electronics" },
    "brand": "Apple",
    "model": "iPhone 12 Pro",
    "price": 45000,
    "condition": "used",
    "usageDuration": "1 year",
    "warrantyRemaining": "6 months",
    "invoiceAvailable": true,
    "specs": { "color": "Space Gray", "storage": "256GB" },
    "productImages": ["/uploads/products/iphone-1673091600000.jpg"],
    "city": "Bangalore",
    "state": "Karnataka",
    "negotiable": true,
    "status": "active",
    "vendor": "67a1c0e7f8b2c123456789aa",
    "viewsCount": 24
  }
}
```

**Error Responses:**
```json
// Not your product (403)
{ "error": "Forbidden" }

// Product not found (404)
{ "error": "Product not found" }
```

---

## 4️⃣ UPDATE PRODUCT ⭐ NEW

### PUT `/vendor/products/:productId`
```http
PUT /api/v1/vendor/products/67a1d5f8c9b3d234567890cd
Authorization: Bearer <vendor-token>
Content-Type: multipart/form-data

Form Fields (all optional):
- title: "iPhone 12 Pro Max"
- price: "50000"
- condition: "like new"
- negotiable: "true"
- specs: '{"color":"Gold","storage":"512GB"}'
- productImages: <new-file-1.jpg> <new-file-2.jpg>
- invoiceImage: <new-invoice.pdf>
```

**Success Response (200):**
```json
{
  "product": {
    "_id": "67a1d5f8c9b3d234567890cd",
    "title": "iPhone 12 Pro Max",  // Updated
    "price": 50000,               // Updated
    "condition": "like new",      // Updated
    "specs": {
      "color": "Gold",            // Updated
      "storage": "512GB"          // Updated
    },
    "productImages": ["/uploads/products/new-file-1673092800000.jpg", ...],  // Replaced
    "invoiceImage": "/uploads/products/new-invoice-1673092800000.pdf",       // Replaced
    "negotiable": true,
    "status": "active",
    "viewsCount": 24,
    "updatedAt": "2026-01-13T10:45:00.000Z"
  }
}
```

**Error Responses:**
```json
// Invalid specs JSON (400)
{ "error": "Invalid specs JSON" }

// Unknown spec key (400)
{ "error": "Unsupported spec key: customField; Field color is required" }

// Not your product (403)
{ "error": "Forbidden" }

// Product not found (404)
{ "error": "Product not found" }
```

---

## 5️⃣ DELETE PRODUCT ⭐ NEW

### DELETE `/vendor/products/:productId`
```http
DELETE /api/v1/vendor/products/67a1d5f8c9b3d234567890cd
Authorization: Bearer <vendor-token>
```

**Success Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Error Responses:**
```json
// Not your product (403)
{ "error": "Forbidden" }

// Product not found (404)
{ "error": "Product not found" }
```

---

## 🔒 Security Rules

| Action | Requirement |
|--------|-------------|
| Create | Vendor authenticated + profile complete |
| Read own | Vendor authenticated |
| Update own | Vendor authenticated + must be owner |
| Delete own | Vendor authenticated + must be owner |
| Read others' | Public via `/api/v1/products` (read-only) |

---

## 📝 Field Update Rules

| Field | Type | Notes |
|-------|------|-------|
| title | string | Required on create, optional on update |
| price | number | Can be updated anytime |
| condition | enum | new \| used (default: used) |
| specs | JSON | Validated against CategoryFieldConfig |
| productImages | file[] | Max 5, replaces existing on update |
| invoiceImage | file | Single, replaces existing on update |
| status | enum | active \| inactive (admin sets, vendor can suggest) |

---

## 💡 Tips & Tricks

1. **Specs Validation:**
   - Must be valid JSON
   - All required fields from CategoryFieldConfig must be present
   - Unknown keys are rejected
   - Type validation: string, number, select, boolean

2. **Image Updates:**
   - Image uploads replace entire array (not appended)
   - Old images are not automatically deleted from disk
   - Max 5 product images, 1 invoice image

3. **Partial Updates:**
   - All fields are optional on PUT
   - Only send fields you want to change
   - Omitted fields retain their existing values

4. **Error Handling:**
   - 400 = Validation error (fix your request)
   - 403 = Ownership/permission error
   - 404 = Resource not found
   - 500 = Server error (check logs)

---

## 🧬 Testing Workflow

```
1. Signup vendor & complete profile (/vendor/profile)
2. Create category via admin (POST /admin/categories)
3. Add category fields (/admin/categories/:id/fields)
4. Create product (POST /vendor/products)
5. Get product (GET /vendor/products/:id)
6. Update product (PUT /vendor/products/:id)
7. List products (GET /vendor/products)
8. Delete product (DELETE /vendor/products/:id)
9. Verify deletion (GET /vendor/products/:id → 404)
```

---
