# Payment Settings Backend - Quick Reference

## 🚀 API Endpoints

### Base URL
```
POST http://localhost:8000/api/payment-settings
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/` | Get current payment settings |
| **PUT** | `/` | Update entire payment settings |
| **POST** | `/upi/add` | Add new UPI account |
| **DELETE** | `/upi/:upiId` | Delete UPI account |
| **PUT** | `/upi/default` | Set default UPI account |

---

## 📋 Example Requests

### 1️⃣ Get Payment Settings
```bash
curl -X GET http://localhost:8000/api/payment-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 2️⃣ Add UPI Account
```bash
curl -X POST http://localhost:8000/api/payment-settings/upi/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1702000001",
    "upiId": "merchant@googleplay",
    "businessName": "Main Store"
  }'
```

### 3️⃣ Set Default UPI
```bash
curl -X PUT http://localhost:8000/api/payment-settings/upi/default \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "upiId": "merchant@googleplay"
  }'
```

### 4️⃣ Delete UPI Account
```bash
curl -X DELETE http://localhost:8000/api/payment-settings/upi/merchant@googleplay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5️⃣ Update All Settings
```bash
curl -X PUT http://localhost:8000/api/payment-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enableCash": true,
    "enableUpi": true,
    "upiAccounts": [
      {
        "id": "1702000001",
        "upiId": "merchant@googleplay",
        "businessName": "Main Store"
      },
      {
        "id": "1702000002",
        "upiId": "secondary@paytm",
        "businessName": "Secondary Store"
      }
    ],
    "defaultUpiId": "1702000001"
  }'
```

---

## 🔐 Authentication

All requests require:
1. **Valid JWT Token** in header: `Authorization: Bearer {token}`
2. **Admin Role** - User must be admin user
3. **User must not be blocked**

---

## ✅ Response Format (Success)

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "enableCash": true,
    "enableUpi": true,
    "upiAccounts": [
      {
        "id": "1702000001",
        "upiId": "merchant@googleplay",
        "businessName": "Main Store"
      }
    ],
    "defaultUpiId": "1702000001",
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:00:00.000Z"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid UPI ID format: invalid"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "admin can access this route"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "UPI account not found"
}
```

---

## 📝 UPI ID Format

Valid UPI IDs must match pattern: `username@bankname`

### Valid Examples:
- ✅ `merchant@googleplay`
- ✅ `store@paytm`
- ✅ `seller_123@okhdfcbank`
- ✅ `user.name@upi`

### Invalid Examples:
- ❌ `merchant` (no @ symbol)
- ❌ `@googleplay` (no username)
- ❌ `merchant@` (no bank)
- ❌ `merchant @googleplay` (space not allowed)

---

## 🔄 Frontend Integration

### React/Axios Example:
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/payment-settings';
const token = localStorage.getItem('authToken');

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Get settings
const getSettings = async () => {
  try {
    const { data } = await axios.get(API_URL, { headers });
    console.log(data.data); // Payment settings object
  } catch (error) {
    console.error(error.response.data.message);
  }
};

// Add UPI
const addUpi = async (id, upiId, businessName) => {
  try {
    const { data } = await axios.post(`${API_URL}/upi/add`, 
      { id, upiId, businessName }, 
      { headers }
    );
    console.log(data.data);
  } catch (error) {
    console.error(error.response.data.message);
  }
};

// Delete UPI
const deleteUpi = async (upiId) => {
  try {
    const { data } = await axios.delete(`${API_URL}/upi/${upiId}`, { headers });
    console.log(data.data);
  } catch (error) {
    console.error(error.response.data.message);
  }
};
```

---

## 🧪 Testing Checklist

- [ ] Can fetch payment settings with admin token
- [ ] Cannot fetch with invalid/missing token
- [ ] Cannot fetch without admin role
- [ ] Can add UPI account successfully
- [ ] Cannot add UPI with invalid format
- [ ] Cannot add duplicate UPI ID
- [ ] Can set default UPI account
- [ ] Can delete UPI account
- [ ] Default UPI switches when active one is deleted
- [ ] Can update all settings at once
- [ ] Validation errors return proper error messages

---

## 📚 Files Structure

```
backend/
├── models/
│   └── paymentSettingsModel.js       ← MongoDB Schema
├── controllers/
│   └── paymentSettingsController.js   ← Business Logic
├── routes/
│   └── paymentSettingsRoute.js        ← API Routes
├── app.js                             ← Route Registration
├── PAYMENT_SETTINGS_API.md            ← Full Documentation
└── IMPLEMENTATION_SUMMARY.md          ← Implementation Details
```

---

## 🛠️ Troubleshooting

### Token Expired
**Error:** 401 Invalid accessToken
**Solution:** Get new token by logging in again

### Not Admin
**Error:** 401 admin can access this route
**Solution:** Login with admin account

### Invalid UPI Format
**Error:** 400 Invalid UPI ID format
**Solution:** Use format: `username@bankname`

### Duplicate UPI ID
**Error:** 400 This UPI ID is already added
**Solution:** Use a different UPI ID

### Default UPI Not Found
**Error:** 400 Default UPI ID must exist in UPI accounts
**Solution:** Use an ID from existing UPI accounts list

---

## ⚡ Performance Notes

- Single database document (singleton pattern) → Fast reads
- Embedded UPI accounts → No joins needed
- Indexed queries → Quick lookups
- Minimal data transfer → Small payload sizes

---

## 📖 Related Documentation

- Full API Docs: `/PAYMENT_SETTINGS_API.md`
- Implementation Summary: `/IMPLEMENTATION_SUMMARY.md`
- Frontend Settings Component: Implemented at `frontend/src/views/admin/settings/PaymentSettings.tsx`
