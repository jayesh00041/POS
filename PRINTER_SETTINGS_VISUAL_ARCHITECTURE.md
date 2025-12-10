# Printer Settings - Visual Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                              │
│                                                                 │
│  Printer Settings Page                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Default Printer: Brother HL-B2080DW ⭐               │   │
│  │                                                         │   │
│  │  [+ Add Printer]                                        │   │
│  │                                                         │   │
│  │  All Printers Table:                                    │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Name    │ Type   │ Status  │ Actions            │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ Main    │ 80mm   │ Active  │ Edit | Delete ✓    │  │   │
│  │  │ Back    │ 58mm   │ Inactive│ Edit | Del | SetDef│  │   │
│  │  │ Guest   │ A4     │ Active  │ Edit | Del | SetDef│  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP Requests
                            ▼
        ┌───────────────────────────────────────┐
        │       BACKEND API                     │
        │                                       │
        │  GET    /printer/list                 │
        │  POST   /printer/add                  │
        │  PUT    /printer/:id                  │
        │  PUT    /printer/:id/set-default      │
        │  DELETE /printer/:id                  │
        │  GET    /printer/default              │
        │                                       │
        └───────────────┬───────────────────────┘
                        │ Query/Update
                        ▼
        ┌───────────────────────────────────────┐
        │      MONGODB                          │
        │                                       │
        │  PaymentSettings                      │
        │  {                                    │
        │    printers: [                        │
        │      {                                │
        │        _id: "xxx",                    │
        │        name: "Main",                  │
        │        type: "thermal-80mm",          │
        │        deviceName: "Brother...",      │
        │        isDefault: true,     ⭐        │
        │        silent: true,                  │
        │        copies: 1,                     │
        │        isActive: true                 │
        │      },                               │
        │      { ... }                          │
        │    ],                                 │
        │    defaultPrinterId: "xxx"            │
        │  }                                    │
        │                                       │
        └──────┬──────────────────────┬─────────┘
               │                      │
               │ Invoice Creation     │ Settings Page
               ▼                      ▼
        ┌──────────────┐      ┌────────────────┐
        │ INVOICE API  │      │ ADMIN SETTINGS │
        │              │      │ (Already has it)
        │ Fetch        │      └────────────────┘
        │ default      │
        │ printer      │
        └──────┬───────┘
               │ Include in response
               ▼
        ┌──────────────────────────┐
        │ FRONTEND (Cart Component)│
        │                          │
        │ Receives:                │
        │ {                        │
        │   invoice: {...},        │
        │   printerConfig: {       │
        │     name: "Main",        │
        │     type: "thermal-80mm",│
        │     silent: true,        │
        │     copies: 1            │
        │   }                      │
        │ }                        │
        └──────┬───────────────────┘
               │ Pass to printer
               ▼
        ┌──────────────────────┐
        │ PRINTER (Electron)   │
        │                      │
        │ Uses printer config  │
        │ Print Receipt        │
        │ ✓ Printed           │
        └──────────────────────┘
```

---

## Database Schema Structure

```
PaymentSettings Collection:
{
  _id: ObjectId,
  companyName: "Your Company",
  companyPhone: "9876543210",
  upiId: "user@upi",
  
  // PRINTER SETTINGS (NEW)
  printers: [
    {
      _id: ObjectId("1"),
      name: "Main Counter",
      type: "thermal-80mm",
      deviceName: "Brother HL-B2080DW",
      isDefault: true,          ⭐ ONLY ONE TRUE
      silent: true,
      printBackground: false,
      color: false,
      copies: 1,
      isActive: true,
      createdAt: ISODate("2024-12-07..."),
      updatedAt: ISODate("2024-12-07...")
    },
    {
      _id: ObjectId("2"),
      name: "Kitchen",
      type: "thermal-80mm",
      deviceName: "Epson TM-T81",
      isDefault: false,         ⭐ 
      silent: true,
      printBackground: false,
      color: false,
      copies: 1,
      isActive: true,
      createdAt: ISODate("2024-12-07..."),
      updatedAt: ISODate("2024-12-07...")
    },
    {
      _id: ObjectId("3"),
      name: "Guest Area",
      type: "standard-a4",
      deviceName: "Canon PIXMA",
      isDefault: false,         ⭐
      silent: false,
      printBackground: true,
      color: true,
      copies: 1,
      isActive: false,          (Inactive)
      createdAt: ISODate("2024-12-07..."),
      updatedAt: ISODate("2024-12-07...")
    }
  ],
  
  defaultPrinterId: ObjectId("1")  ⭐ Quick lookup
}
```

---

## API Request/Response Examples

### 1. List All Printers
```
GET /api/payment-settings/printer/list

Response (200):
{
  "status": "success",
  "data": {
    "printers": [
      {
        "_id": "1",
        "name": "Main Counter",
        "type": "thermal-80mm",
        "isDefault": true,
        "isActive": true
      },
      {
        "_id": "2",
        "name": "Kitchen",
        "type": "thermal-80mm",
        "isDefault": false,
        "isActive": true
      }
    ],
    "defaultPrinterId": "1"
  }
}
```

### 2. Add New Printer
```
POST /api/payment-settings/printer/add
Authorization: Bearer <token>

Request:
{
  "name": "Kitchen Printer",
  "type": "thermal-80mm",
  "deviceName": "Epson TM-T81",
  "silent": true,
  "printBackground": false,
  "color": false,
  "copies": 1
}

Response (201):
{
  "status": "success",
  "data": {
    "printer": {
      "_id": "xyz123",
      "name": "Kitchen Printer",
      "type": "thermal-80mm",
      "deviceName": "Epson TM-T81",
      "isDefault": false,
      "isActive": true,
      "silent": true,
      "copies": 1,
      "createdAt": "2024-12-07T..."
    }
  }
}
```

### 3. Set as Default
```
PUT /api/payment-settings/printer/:printerId/set-default
Authorization: Bearer <token>

Request: {} (empty body)

Response (200):
{
  "status": "success",
  "data": {
    "printer": {
      "_id": "xyz123",
      "name": "Kitchen Printer",
      "type": "thermal-80mm",
      "isDefault": true,        ⭐ Changed!
      "isActive": true
    }
  }
}
```

### 4. Delete Printer
```
DELETE /api/payment-settings/printer/:printerId
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "message": "Printer deleted successfully"
}

Error if default (400):
{
  "status": "error",
  "message": "Cannot delete default printer. Set another printer as default first."
}
```

### 5. Get Default Printer (For Invoice)
```
GET /api/payment-settings/printer/default
(No auth needed - called during invoice creation)

Response (200):
{
  "status": "success",
  "data": {
    "printer": {
      "_id": "1",
      "name": "Main Counter",
      "type": "thermal-80mm",
      "deviceName": "Brother HL-B2080DW",
      "silent": true,
      "printBackground": false,
      "color": false,
      "copies": 1
    }
  }
}

Error if none set (404):
{
  "status": "error",
  "message": "No default printer set"
}
```

---

## Frontend Component Flow

```
PrinterSettingsPage
├── State Management
│   ├── printers[]
│   ├── defaultPrinterId
│   ├── selectedPrinter (for edit)
│   └── isLoading
│
├── Data Fetching (useQuery)
│   └── GET /printer/list
│
├── Actions (useMutation)
│   ├── addPrinter (POST)
│   ├── updatePrinter (PUT)
│   ├── deletePrinter (DELETE)
│   └── setDefaultPrinter (PUT /set-default)
│
└── UI Sections
    ├── Default Printer Card
    │   └── Shows current default with ⭐
    │
    ├── Add Printer Button
    │   └── Opens AddPrinterModal
    │
    ├── Printers Table
    │   ├── Displays all printers
    │   ├── Edit button → EditPrinterModal
    │   ├── Delete button (disabled if default)
    │   └── Set Default button (if not default)
    │
    ├── AddPrinterModal
    │   ├── Form inputs
    │   └── Submit action
    │
    └── EditPrinterModal
        ├── Pre-filled form
        └── Submit action
```

---

## State Transitions

```
Initial State:
  printers: []
  defaultPrinterId: null

After Load:
  printers: [Main, Kitchen, Guest]
  defaultPrinterId: "1" (Main)

User Adds Printer:
  printers: [Main, Kitchen, Guest, NewOne]
  defaultPrinterId: "1" (unchanged)

User Edits Printer:
  printers: [MainEdited, Kitchen, Guest, NewOne]
  defaultPrinterId: "1" (unchanged)

User Sets Different Default:
  printers: [Main, KitchenDefault, Guest, NewOne]
  defaultPrinterId: "2" (changed)

User Deletes Non-Default:
  printers: [Main, KitchenDefault, NewOne]
  defaultPrinterId: "2" (unchanged)

User Deletes (blocked - is default):
  Error: "Cannot delete default printer"
  State unchanged
```

---

## Error Scenarios

```
Scenario 1: No Default Set
├── Admin hasn't added any printer
├── API: GET /printer/default → 404
├── Invoice Creation: Sends printerConfig: null
└── Frontend: Falls back to browser print dialog

Scenario 2: Try Delete Default
├── User clicks delete on default printer
├── API: DELETE /printer/:id → 400
├── Error toast: "Cannot delete default printer..."
└── User must set different default first

Scenario 3: Invalid Printer ID
├── Corrupt data or manual API call
├── API: PUT /printer/invalidId → 404
├── Error toast: "Printer not found"
└── Page refreshes to get latest state

Scenario 4: Network Error
├── Connection drops during add
├── useQuery/useMutation handles
├── Error toast displayed
└── Retry option available
```

---

## Implementation Summary

**What Gets Built:**
✅ Simple, focused printer management
✅ One global default for all users
✅ 6 clean API endpoints
✅ Single-tab admin UI
✅ Automatic invoice integration
✅ Minimal configuration overhead

**What Stays Removed:**
❌ Multi-user printer assignment
❌ Use case differentiation
❌ Counter-level routing
❌ Complex state management

**Ready to proceed?** Confirm and I'll start implementation!
