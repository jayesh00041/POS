# Payment Settings API Documentation

## Base URL
```
/api/payment-settings
```

## Authentication
All endpoints require:
- **Token Authorization**: Valid JWT token in Authorization header
- **Admin Access**: User must have admin role

## Endpoints

### 1. Get Payment Settings
**Endpoint:** `GET /`

**Authentication:** Required (Admin only)

**Description:** Retrieve current payment settings including enabled payment methods and UPI accounts.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Payment settings retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
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
    "defaultUpiId": "1702000001",
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:00:00.000Z"
  }
}
```

**Response (404):** If settings not found (will create default ones on first call)

---

### 2. Update Payment Settings
**Endpoint:** `PUT /`

**Authentication:** Required (Admin only)

**Description:** Update payment method toggles and UPI account list in one request.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
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
}
```

**Validation Rules:**
- `enableCash` (boolean, required)
- `enableUpi` (boolean, required)
- `upiAccounts` (array): Each account must have:
  - `id` (string, required, unique)
  - `upiId` (string, required, must match UPI format)
  - `businessName` (string, required)
- `defaultUpiId` (string): Must match an existing account ID

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Payment settings updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "enableCash": true,
    "enableUpi": true,
    "upiAccounts": [...],
    "defaultUpiId": "1702000001",
    "updatedAt": "2024-12-06T10:05:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid UPI ID format or validation error
- `401`: Unauthorized (invalid/missing token or not admin)
- `500`: Server error

---

### 3. Add UPI Account
**Endpoint:** `POST /upi/add`

**Authentication:** Required (Admin only)

**Description:** Add a new UPI account to payment settings.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "1702000003",
  "upiId": "tertiary@okhdfcbank",
  "businessName": "Third Location"
}
```

**Validation Rules:**
- `id` (string, required, must be unique)
- `upiId` (string, required, format: `username@bankname`, case-insensitive)
- `businessName` (string, required)

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "UPI account added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "enableCash": true,
    "enableUpi": true,
    "upiAccounts": [
      {
        "id": "1702000001",
        "upiId": "merchant@googleplay",
        "businessName": "Main Store"
      },
      {
        "id": "1702000003",
        "upiId": "tertiary@okhdfcbank",
        "businessName": "Third Location"
      }
    ],
    "defaultUpiId": "1702000001",
    "updatedAt": "2024-12-06T10:10:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid UPI format
- `400`: UPI ID already exists
- `401`: Unauthorized
- `500`: Server error

---

### 4. Remove UPI Account
**Endpoint:** `DELETE /upi/:upiId`

**Authentication:** Required (Admin only)

**Description:** Remove a UPI account by UPI ID.

**Request Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `upiId` (string, required): The UPI ID to remove (e.g., `merchant@googleplay`)

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "UPI account removed successfully",
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
    "updatedAt": "2024-12-06T10:15:00.000Z"
  }
}
```

**Behavior:**
- If the deleted account was the default, automatically sets default to the first remaining account
- If no accounts remain, clears the `defaultUpiId`

**Error Responses:**
- `400`: UPI ID not provided
- `404`: UPI account not found
- `404`: Payment settings not found
- `401`: Unauthorized
- `500`: Server error

---

### 5. Set Default UPI Account
**Endpoint:** `PUT /upi/default`

**Authentication:** Required (Admin only)

**Description:** Set a UPI account as the default for collecting payments.

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "upiId": "merchant@googleplay"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Default UPI account updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
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
    "defaultUpiId": "1702000001",
    "updatedAt": "2024-12-06T10:20:00.000Z"
  }
}
```

**Error Responses:**
- `400`: UPI ID not provided
- `404`: UPI account not found
- `404`: Payment settings not found
- `401`: Unauthorized
- `500`: Server error

---

## Data Structure

### PaymentSettings Model
```javascript
{
  _id: ObjectId,
  enableCash: boolean,           // Enable/disable cash payments
  enableUpi: boolean,            // Enable/disable UPI payments
  upiAccounts: [
    {
      id: string,                // Unique identifier for UPI account
      upiId: string,             // UPI ID (e.g., user@googleplay)
      businessName: string       // Display name for the UPI account
    }
  ],
  defaultUpiId: string,          // ID of the active UPI for payments
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
// Get payment settings
const response = await fetch('/api/payment-settings', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);

// Add UPI account
const addResponse = await fetch('/api/payment-settings/upi/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: Date.now().toString(),
    upiId: 'newstore@googleplay',
    businessName: 'New Location'
  })
});
```

### Axios
```javascript
// Get payment settings
const { data } = await axios.get('/api/payment-settings', {
  headers: { Authorization: `Bearer ${token}` }
});

// Update settings
const { data } = await axios.put('/api/payment-settings', {
  enableCash: true,
  enableUpi: true,
  upiAccounts: [...],
  defaultUpiId: '1702000001'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 201 | Created | Resource successfully created |
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing/invalid token or insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## Notes

- All UPI IDs are stored in lowercase for consistency
- UPI ID format is validated: `username@bankname`
- Only one default UPI account can be active at a time
- If all UPI accounts are deleted while enabled, consider disabling UPI payments
- Admin privileges required for all operations
- Payment settings are singleton (only one document in collection)
