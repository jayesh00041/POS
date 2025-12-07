# Payment Settings Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/TypeScript)                  │
│                   PaymentSettings Component                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Cash    │  │   UPI    │  │  Add     │  │  Remove  │          │
│  │ Toggle   │  │ Toggle   │  │  UPI     │  │  UPI     │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│       │              │              │              │              │
│       └──────────────┴──────────────┴──────────────┘              │
│                      │                                             │
│              usePaymentSettings()                                 │
│                      │                                             │
└──────────────────────┼─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP REQUESTS                                 │
│  GET /api/payment-settings                                       │
│  PUT /api/payment-settings                                       │
│  POST /api/payment-settings/upi/add                              │
│  DELETE /api/payment-settings/upi/:upiId                         │
│  PUT /api/payment-settings/upi/default                           │
└──────────────────────┬────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER (Backend)                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Express Server (app.js)                                │     │
│  │ app.use("/api/payment-settings", paymentSettingsRoute) │     │
│  └─────────────────┬──────────────────────────────────────┘     │
│                    │                                              │
│  ┌─────────────────▼──────────────────────────────────────┐     │
│  │ Route Handler (paymentSettingsRoute.js)                │     │
│  │ ┌────────────────────────────────────────────────────┐ │     │
│  │ │ GET / → isUserVarified → isAdminUser → Controller │ │     │
│  │ │ PUT / → isUserVarified → isAdminUser → Controller │ │     │
│  │ │ POST /upi/add → ... → addUpiAccount               │ │     │
│  │ │ DELETE /upi/:upiId → ... → removeUpiAccount       │ │     │
│  │ │ PUT /upi/default → ... → setDefaultUpi            │ │     │
│  │ └────────────────────────────────────────────────────┘ │     │
│  └─────────────────┬──────────────────────────────────────┘     │
│                    │                                              │
│  ┌─────────────────▼──────────────────────────────────────┐     │
│  │ Controller Layer (paymentSettingsController.js)        │     │
│  │ ┌────────────────────────────────────────────────────┐ │     │
│  │ │ getPaymentSettings()                               │ │     │
│  │ │ updatePaymentSettings()                            │ │     │
│  │ │ addUpiAccount()          → Validation              │ │     │
│  │ │ removeUpiAccount()       → Database Ops            │ │     │
│  │ │ setDefaultUpi()          → Error Handling          │ │     │
│  │ └────────────────────────────────────────────────────┘ │     │
│  └─────────────────┬──────────────────────────────────────┘     │
│                    │                                              │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Mongoose Model (paymentSettingsModel.js)               │    │
│  │                                                          │    │
│  │ Schema Definition:                                       │    │
│  │ {                                                        │    │
│  │   enableCash: Boolean,                                  │    │
│  │   enableUpi: Boolean,                                   │    │
│  │   upiAccounts: [                                        │    │
│  │     {                                                   │    │
│  │       id: String (unique),                             │    │
│  │       upiId: String (format-validated),                │    │
│  │       businessName: String                             │    │
│  │     }                                                   │    │
│  │   ],                                                    │    │
│  │   defaultUpiId: String (reference validated),          │    │
│  │   timestamps: {createdAt, updatedAt}                   │    │
│  │ }                                                        │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         │                                        │
│  ┌──────────────────────▼─────────────────────────────────┐    │
│  │ MongoDB Database                                        │    │
│  │ Collection: paymentSettings                             │    │
│  │ (Singleton - only one document)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
                    ┌─────────────────────────────┐
                    │   User Action (Frontend)    │
                    │   - Add UPI                 │
                    │   - Delete UPI              │
                    │   - Set Default             │
                    └────────────┬────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │   Create API Request        │
                    │   POST /upi/add             │
                    │   {id, upiId, businessName}│
                    └────────────┬────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │   Token Verification       │
                    │   isUserVarified()         │
                    └──┬─────────────────────┬───┘
                       │ Valid              │ Invalid
                       ▼                    ▼
                    ┌──────────┐      ┌──────────────┐
                    │ Continue │      │ 401 Error    │
                    └─────┬────┘      └──────────────┘
                          │
                          ▼
                    ┌─────────────────────────────┐
                    │   Admin Check              │
                    │   isAdminUser()            │
                    └──┬─────────────────────┬───┘
                       │ Admin              │ Not Admin
                       ▼                    ▼
                    ┌──────────┐      ┌──────────────┐
                    │ Continue │      │ 401 Error    │
                    └─────┬────┘      └──────────────┘
                          │
                          ▼
                    ┌─────────────────────────────┐
                    │   Controller Function       │
                    │   addUpiAccount()           │
                    └─────────┬───────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
      ┌──────────┐    ┌──────────────┐   ┌──────────┐
      │ Validate │    │ Check if     │   │ Format   │
      │ Required │    │ Duplicate    │   │ UPI ID   │
      │ Fields   │    │ Exists       │   │ (Regex)  │
      └─────┬────┘    └──┬───────────┘   └────┬─────┘
            │            │                     │
            └────────────┬┴─────────────────────┘
                         │
              ┌──────────┴──────────┐
              │ All Valid          │ Validation Error
              ▼                    ▼
        ┌──────────────┐      ┌─────────────────┐
        │ Fetch from   │      │ Return 400      │
        │ Database     │      │ Error Response  │
        └──┬───────────┘      └─────────────────┘
           │
           ▼
    ┌────────────────────────┐
    │ Update Database        │
    │ - Add UPI to array     │
    │ - Update timestamps    │
    │ - Set default if first │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Return 201 Created     │
    │ Response with Data     │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Frontend Update State  │
    │ - Update local state   │
    │ - Show success toast   │
    │ - Update UI            │
    └────────────────────────┘
```

## File Dependencies

```
app.js
  │
  ├── routes/paymentSettingsRoute.js
  │     │
  │     ├── controllers/paymentSettingsController.js
  │     │     │
  │     │     └── models/paymentSettingsModel.js
  │     │           │
  │     │           └── MongoDB Collection
  │     │
  │     └── middlewares/
  │           ├── tokenValidator.js (isUserVarified)
  │           └── adminAccessHandler.js (isAdminUser)
  │
  ├── middlewares/globalErrorHanddler.js
  │
  └── config/
        └── database.js
```

## Request/Response Cycle Example

```
1. Frontend Request:
   ┌─────────────────────────────────────────────┐
   │ POST /api/payment-settings/upi/add          │
   │ Authorization: Bearer eyJhbGc...             │
   │ {                                           │
   │   "id": "1702000001",                       │
   │   "upiId": "merchant@googleplay",           │
   │   "businessName": "Main Store"              │
   │ }                                           │
   └─────────────────────────────────────────────┘
                      │
                      ▼
2. Server Processing:
   ┌─────────────────────────────────────────────┐
   │ ✓ Parse JWT Token                          │
   │ ✓ Verify User is Admin                     │
   │ ✓ Validate UPI ID Format                   │
   │ ✓ Check for Duplicates                     │
   │ ✓ Fetch Current Settings                   │
   │ ✓ Add UPI to Array                         │
   │ ✓ Update Database                          │
   │ ✓ Generate Response                        │
   └─────────────────────────────────────────────┘
                      │
                      ▼
3. Success Response (201 Created):
   ┌─────────────────────────────────────────────┐
   │ {                                           │
   │   "status": "success",                      │
   │   "message": "UPI account added successfully",
   │   "data": {                                 │
   │     "_id": "507f1f77bcf86cd799439011",      │
   │     "enableCash": true,                     │
   │     "enableUpi": true,                      │
   │     "upiAccounts": [                        │
   │       {                                     │
   │         "id": "1702000001",                 │
   │         "upiId": "merchant@googleplay",     │
   │         "businessName": "Main Store"        │
   │       }                                     │
   │     ],                                      │
   │     "defaultUpiId": "1702000001"            │
   │   }                                         │
   │ }                                           │
   └─────────────────────────────────────────────┘
```

## Security Flow

```
              HTTP Request
                   │
                   ▼
         ┌─────────────────────┐
         │ CORS Validation     │
         │ (app.js)            │
         └────┬────────────────┘
              │
              ▼
         ┌─────────────────────┐
         │ Token Extraction    │
         │ from Authorization  │
         │ Header              │
         └────┬────────────────┘
              │
              ▼
         ┌─────────────────────┐
         │ JWT Verification    │
         │ (tokenValidator)    │
         └──┬──────────────┬───┘
            │ Valid        │ Invalid/Expired
            ▼              ▼
         ┌──────┐      ┌─────────────┐
         │ Pass │      │ 401 Error   │
         └──┬───┘      └─────────────┘
            │
            ▼
       ┌──────────────────────┐
       │ Role Check           │
       │ isAdminUser()        │
       └──┬──────────┬────────┘
          │ Admin    │ Non-Admin
          ▼          ▼
       ┌────────┐ ┌─────────────┐
       │ Access │ │ 401 Error   │
       │ Granted│ └─────────────┘
       └────────┘
```

## Error Handling Flow

```
                 Request
                    │
                    ▼
         ┌──────────────────────┐
         │ Controller Function  │
         └──┬─────────────────┬─┘
            │                 │
    ┌───────┘                 └──────┐
    │                                │
    ▼ (Error Found)                  ▼ (Success)
┌─────────────────────┐      ┌──────────────────┐
│ Validation Error    │      │ Process Request  │
│ - Invalid format    │      │ - Query DB       │
│ - Missing fields    │      │ - Update DB      │
│ - Duplicate exists  │      │ - Format Response│
└──┬────────┬─────┬──┘      └────────┬─────────┘
   │        │     │                  │
   ▼        ▼     ▼                  ▼
┌────────────────────────┐  ┌──────────────────┐
│ next(createHttpError(  │  │ res.status(200)  │
│   400,                 │  │   .json({        │
│   "message"            │  │     data: {...}  │
│ ))                     │  │   })             │
└────────┬───────────────┘  └──────────┬───────┘
         │                            │
         ▼                            ▼
┌──────────────────────┐      ┌───────────────┐
│ Global Error Handler │      │ Client Success│
│ (middleware)         │      │ Response      │
└────────┬─────────────┘      └───────────────┘
         │
         ▼
    ┌─────────────┐
    │ Error JSON  │
    │ Response    │
    └─────────────┘
```

This architecture ensures:
✅ Clean separation of concerns
✅ Secure authentication & authorization
✅ Proper error handling
✅ Scalable data structure
✅ Type safety (frontend)
✅ Data validation (backend)
