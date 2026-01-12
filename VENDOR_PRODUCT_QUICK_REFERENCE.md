## 🚀 Vendor Product UPDATE & DELETE - Quick Reference

### ✏️ UPDATE Product

```bash
# cURL Example
curl -X PUT http://localhost:5000/api/v1/vendor/products/67a1d5f8c9b3d234567890cd \
  -H "Authorization: Bearer <vendor-token>" \
  -F "title=iPhone 12 Pro Max" \
  -F "price=50000" \
  -F "condition=like new" \
  -F "negotiable=true" \
  -F "productImages=@image1.jpg" \
  -F "productImages=@image2.jpg"
```

**What can be updated:**
- `title`, `description`, `brand`, `model`
- `price`, `condition`, `status`
- `city`, `state`, `negotiable`
- `usageDuration`, `warrantyRemaining`, `invoiceAvailable`
- `knownIssues` (JSON string)
- `specs` (JSON string - validated!)
- `productImages` (file array, max 5)
- `invoiceImage` (single file)

**Validation:**
- Specs must be valid JSON
- All required spec fields per CategoryFieldConfig required
- No unknown spec keys allowed
- Images must be jpg/jpeg/png/webp (max 2MB)

**Response on success:**
```json
{
  "product": {
    "_id": "...",
    "title": "Updated title",
    "price": 50000,
    "...": "...other fields..."
  }
}
```

**Errors:**
- `400` - Invalid input (validation failed)
- `403` - Not product owner
- `404` - Product not found
- `401` - Missing/invalid token

---

### 🗑️ DELETE Product

```bash
# cURL Example
curl -X DELETE http://localhost:5000/api/v1/vendor/products/67a1d5f8c9b3d234567890cd \
  -H "Authorization: Bearer <vendor-token>"
```

**What happens:**
- Product permanently deleted from database
- No undo possible
- Only product owner can delete

**Response on success:**
```json
{
  "message": "Product deleted successfully"
}
```

**Errors:**
- `403` - Not product owner
- `404` - Product not found
- `401` - Missing/invalid token

---

### 🔑 Key Points

| Item | Rule |
|------|------|
| **Ownership** | Vendor can only update/delete own products |
| **Validation** | Input validated server-side |
| **Specs** | Checked against CategoryFieldConfig |
| **Images** | Replaced entirely (not appended) |
| **Delete** | Hard delete (permanent) |
| **Partial Updates** | All fields optional on PUT |

---

### 🎯 Example Workflow

```javascript
// 1. Get your products
GET /api/v1/vendor/products
Authorization: Bearer <token>

// 2. Find product ID from response
// "67a1d5f8c9b3d234567890cd"

// 3. Update it
PUT /api/v1/vendor/products/67a1d5f8c9b3d234567890cd
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=New Title
price=25000

// 4. Or delete it
DELETE /api/v1/vendor/products/67a1d5f8c9b3d234567890cd
Authorization: Bearer <token>
```

---

### ⚠️ Ownership Check

The backend enforces:
```javascript
if (!product.vendor.equals(req.vendor._id)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

This means:
- ✅ Vendor A can update their own products
- ❌ Vendor A cannot update Vendor B's products
- ❌ Admin cannot use these endpoints (separate admin APIs)

---

### 📊 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Product updated/deleted |
| 400 | Bad request | Invalid specs JSON |
| 401 | Unauthorized | Missing token |
| 403 | Forbidden | Not product owner |
| 404 | Not found | Product doesn't exist |
| 500 | Server error | Database issue |

---

### 🧪 Postman Setup

1. **Create request:** PUT `/vendor/products/:productId`
2. **Auth tab:** 
   - Type: Bearer Token
   - Token: `<your-vendor-jwt>`
3. **Body tab:**
   - form-data mode
   - Key-value pairs for text
   - file type for images
4. **Send!**

---

### 📝 Notes

- Fields omitted from PUT request are NOT changed
- Image uploads replace entire array
- Specs validation is strict (no extra keys)
- All operations require vendor authentication
- Product must belong to authenticated vendor

---

**Quick test:**
- Update: `PUT /vendor/products/[id]` with `title=test`
- Delete: `DELETE /vendor/products/[id]`
- Check: `GET /vendor/products` to see changes

