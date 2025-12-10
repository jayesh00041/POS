# Printer Settings System - Comprehensive Redesign Plan

## 1. Problem Statement

The current printer settings implementation is overly simplistic and doesn't account for:
- **Multiple Users**: Different users may need different printers
- **Multiple Counters**: Each counter can have its own set of printers
- **Multiple Printers**: Not just one default printer per use case
- **Complex Workflows**: Kitchen orders, counter tokens, invoices might all go to different printers
- **Flexible Configuration**: Easy to add/remove/modify printer assignments

## 2. Core Concepts & Entities

### 2.1 Entity Relationships

```
Organization (POS System)
├── Counters (Counter 1, Counter 2, Counter 3...)
│   ├── Users (User A, User B, User C...)
│   └── Printer Assignments
├── Printers (Physical devices available in the organization)
│   ├── Printer 1 (80mm Thermal - "Kitchen")
│   ├── Printer 2 (58mm Thermal - "Counter")
│   ├── Printer 3 (A4 Laser - "Admin")
│   └── ...
└── Printer Configuration Rules
    ├── Counter-Level Rules (Which printers for Counter 1?)
    ├── User-Level Overrides (User A always uses Printer X)
    └── Use-Case Rules (Invoice → Printer 1, Token → Printer 2)
```

### 2.2 Three-Layer Selection Logic

**Priority Order for Printer Selection:**

1. **User Override** (Highest Priority)
   - Does the specific user have a printer assignment?
   - Example: User "Ali" at Counter 2 always uses Printer X

2. **Counter Default** (Medium Priority)
   - Does the counter have a default printer for this use case?
   - Example: Counter 1 uses Printer A for invoices

3. **Global Default** (Lowest Priority)
   - Fall back to organization-wide settings
   - Example: Organization default printer is Printer B

## 3. Schema Design

### 3.1 Core Printer Document

```javascript
// Collections/Documents to be created/modified:

// 1. PRINTER DEVICE REGISTRY (Global)
PrinterDevice {
  _id: ObjectId,
  printerId: String (unique, UUID),           // e.g., "PRINTER_001"
  displayName: String,                         // e.g., "Kitchen Printer #1"
  deviceName: String,                          // System device name from OS
  type: String (enum),                         // 'thermal-80mm', 'thermal-58mm', 'standard-a4'
  status: String (enum),                       // 'active', 'inactive', 'maintenance'
  location: String,                            // Optional: Physical location
  
  // Default Configuration (can be overridden at counter/user level)
  defaultConfig: {
    silent: Boolean (default: true),           // Don't show print dialog
    printBackground: Boolean (default: true),  // Include background
    color: Boolean (default: true),            // Color or B&W
    copies: Number (default: 1),               // Number of copies
    paperSize: String (optional),              // A4, 80mm, 58mm
    margins: Object (optional),                // Top, bottom, left, right
  },
  
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    createdBy: ObjectId (ref: User),
    notes: String,
  }
}

// 2. COUNTER PRINTER CONFIGURATION (Per Counter)
CounterPrinterConfig {
  _id: ObjectId,
  counterId: Number (required),                // 1, 2, 3, etc.
  
  // Use Case to Printer Mapping (for this counter)
  useCasePrinters: {
    invoice: {
      primaryPrinterId: String,                // First choice
      fallbackPrinterId: String,               // If primary fails
      config: { ...customConfig },             // Override defaults
    },
    kitchenOrder: {
      primaryPrinterId: String,
      fallbackPrinterId: String,
      config: { ...customConfig },
    },
    counterToken: {
      primaryPrinterId: String,
      fallbackPrinterId: String,
      config: { ...customConfig },
    },
    label: {
      primaryPrinterId: String,
      fallbackPrinterId: String,
      config: { ...customConfig },
    },
  },
  
  // Counter-specific settings
  defaultPrinterId: String,                    // Fallback if use case not mapped
  isActive: Boolean (default: true),
  
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    updatedBy: ObjectId (ref: User),
  }
}

// 3. USER PRINTER OVERRIDE (Per User, Per Counter)
UserPrinterOverride {
  _id: ObjectId,
  userId: ObjectId (required, ref: User),
  counterId: Number (required),
  
  // User's printer assignments at this counter
  printerAssignments: [
    {
      printerId: String,                       // Which printer
      useCases: [String],                      // For which use cases
      isPrimary: Boolean (default: false),     // Main printer for this user
      config: { ...customConfig },             // User-specific config override
    }
  ],
  
  // If user has a universal primary printer (used across all use cases)
  primaryPrinterId: String (optional),
  
  isActive: Boolean (default: true),
  
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    updatedBy: ObjectId (ref: User),
  }
}

// 4. PAYMENT SETTINGS (Simplified - remove printer logic)
PaymentSettings {
  _id: ObjectId,
  enableCash: Boolean,
  enableUpi: Boolean,
  upiAccounts: [UPIAccountSchema],
  defaultUpiId: String,
  
  // Global printer defaults (fallback of fallback)
  globalPrinterDefaults: {
    defaultPrinterId: String,
    useCaseMappings: {
      invoice: String,
      kitchenOrder: String,
      counterToken: String,
      label: String,
    }
  },
  
  timestamps
}
```

## 4. Data Flow & Operations

### 4.1 Creating an Invoice (Printer Selection)

```
When Invoice is created:
├─ Get invoice details (counterId, createdBy userId, use case: "invoice")
├─ Call: selectPrinter(counterId, userId, "invoice")
│
└─ selectPrinter() Logic:
   ├─ Check: UserPrinterOverride for (userId, counterId, "invoice")
   │  └─ If found → Use it (with fallback if available)
   │
   ├─ Else: Check CounterPrinterConfig for (counterId, "invoice")
   │  └─ If found → Use it (with fallback if available)
   │
   ├─ Else: Check PaymentSettings.globalPrinterDefaults["invoice"]
   │  └─ If found → Use it
   │
   └─ Else: Return null (No printer configured)
```

### 4.2 API Endpoints Structure

```
Admin Printer Management:
├── GET /api/printers
│   └─ List all available printers in organization
├── POST /api/printers
│   └─ Add new printer device
├── PUT /api/printers/:printerId
│   └─ Update printer configuration
├── DELETE /api/printers/:printerId
│   └─ Remove printer from inventory
│
Counter-Specific Configuration:
├── GET /api/counter/:counterId/printers
│   └─ Get printer config for a specific counter
├── PUT /api/counter/:counterId/printers
│   └─ Update which printers are used at this counter
├── POST /api/counter/:counterId/printers/:printerId/assign
│   └─ Assign printer to counter for specific use case
│
User-Specific Override:
├── GET /api/user/:userId/counter/:counterId/printers
│   └─ Get user's printer assignments at a counter
├── POST /api/user/:userId/counter/:counterId/printers/assign
│   └─ Override printer for specific user at specific counter
├── PUT /api/user/:userId/counter/:counterId/printers/:printerId
│   └─ Modify user's printer assignment
├── DELETE /api/user/:userId/counter/:counterId/printers/:printerId
│   └─ Remove user's printer override
│
Printer Selection (for client use):
├── POST /api/select-printer
│   ├─ Input: { counterId, userId, useCase }
│   └─ Output: { printerId, printerName, config }
└─ This is what InvoicePopup/Kitchen/Token will call
```

## 5. UI Components Structure

### 5.1 Admin Settings Pages

```
Printer Management UI:
├─ Tab 1: Printer Inventory
│  ├─ Add New Printer Form
│  │  ├─ Display Name
│  │  ├─ Device Name (from system)
│  │  ├─ Type (Dropdown)
│  │  ├─ Location (Optional)
│  │  └─ Default Config (Silent, BG, Color, Copies)
│  └─ Printer List Table
│     ├─ Edit / Delete / Test Print buttons
│     └─ Status badge (Active/Inactive)
│
├─ Tab 2: Counter Configuration
│  ├─ Counter Selector (Dropdown: Counter 1, 2, 3...)
│  ├─ Use Case Settings (4 cards)
│  │  ├─ Invoice: [Primary] [Fallback] [Config]
│  │  ├─ Kitchen: [Primary] [Fallback] [Config]
│  │  ├─ Token: [Primary] [Fallback] [Config]
│  │  └─ Label: [Primary] [Fallback] [Config]
│  └─ Counter Default: [Dropdown]
│
└─ Tab 3: User Override
   ├─ User + Counter Selector
   ├─ Printer Assignment List
   │  ├─ Add Override Form
   │  │  ├─ Printer (Dropdown)
   │  │  ├─ Use Cases (Multi-select: Invoice, Kitchen, Token, Label)
   │  │  ├─ Primary? (Checkbox)
   │  │  └─ Config Override (Optional)
   │  └─ Assignment List with Edit/Delete
   └─ Primary Printer (Quick selector)
```

### 5.2 Data Flow in UI

```
Admin opens PrinterSettings:
├─ Load all printers (Tab 1)
├─ Load all counters (Tab 2)
├─ When counter selected:
│  └─ Load that counter's printer config
├─ When user+counter selected (Tab 3):
│  └─ Load user's overrides for that counter
└─ All changes auto-save via API
```

## 6. Configuration Examples

### Example 1: Small Restaurant (3 Counters, 2 Printers)

```
Printers Available:
├─ Printer 1: 80mm Thermal (Kitchen)
└─ Printer 2: 58mm Thermal (Counter)

Counter 1 (Dine-in):
├─ Invoice → Printer 2 (customer receipt)
├─ Kitchen → Printer 1 (kitchen order)
├─ Token → Printer 2 (counter token)
└─ Label → Printer 2

Counter 2 (Takeout):
├─ Invoice → Printer 2
├─ Kitchen → Printer 1
├─ Token → Printer 2
└─ Label → Printer 2

Counter 3 (Delivery):
├─ Invoice → Printer 2
├─ Kitchen → Printer 1
├─ Token → Printer 2
└─ Label → Printer 2

User "Ahmed" at Counter 1:
├─ Override: Always use Printer 1 for invoices (testing)

User "Fatima" at Counter 2:
└─ Override: Uses primary printer assignment only
```

### Example 2: Large Restaurant (5 Counters, 6 Printers)

```
Printers:
├─ P1: Kitchen Label (80mm, for bills)
├─ P2: Kitchen Order (80mm, for orders)
├─ P3: Counter Token (58mm, for tokens)
├─ P4: Counter Receipt (58mm, for receipts)
├─ P5: Manager Station (A4, for reports)
└─ P6: Backup (58mm, emergency)

Each Counter:
├─ Invoice → P4 (with fallback to P6)
├─ Kitchen → P2 (with fallback to P1)
├─ Token → P3 (with fallback to P4)
└─ Label → P1

User Overrides:
├─ Manager "Ali": Counter 1 → Always P5 (reports)
├─ Manager "Zara": Counter 5 → Always P4 (dual-check)
└─ New User "Hamza": Counter 2 → Uses defaults
```

## 7. Implementation Roadmap

### Phase 1: Database Schema Update
- [ ] Keep PaymentSettings but simplify it
- [ ] Create PrinterDevice collection
- [ ] Create CounterPrinterConfig collection
- [ ] Create UserPrinterOverride collection
- [ ] Create data migration script

### Phase 2: Backend APIs
- [ ] Implement printer CRUD endpoints
- [ ] Implement counter printer config endpoints
- [ ] Implement user override endpoints
- [ ] Implement printer selection endpoint (`/api/select-printer`)
- [ ] Update InvoiceController to use new printer selection

### Phase 3: Admin UI
- [ ] Create PrinterSettingsPage with 3 tabs
- [ ] Implement printer inventory management
- [ ] Implement counter configuration UI
- [ ] Implement user override UI
- [ ] Add test print functionality

### Phase 4: Integration
- [ ] Update InvoicePopup to call `/api/select-printer`
- [ ] Update KitchenOrders to use new system
- [ ] Update CounterTokens to use new system
- [ ] Update frontend to pass counterId/userId/useCase

### Phase 5: Testing & Deployment
- [ ] Test with sample data
- [ ] Load testing with multiple counters
- [ ] User acceptance testing
- [ ] Production deployment

## 8. Input/Output Examples

### API: Add Printer Device

**Input:**
```json
{
  "displayName": "Kitchen Order Printer",
  "deviceName": "Brother HL-B2080DW",
  "type": "thermal-80mm",
  "location": "Kitchen Area",
  "defaultConfig": {
    "silent": true,
    "printBackground": true,
    "color": false,
    "copies": 1
  }
}
```

**Output:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "printerId": "PRINTER_001",
    "displayName": "Kitchen Order Printer",
    "deviceName": "Brother HL-B2080DW",
    "type": "thermal-80mm",
    "status": "active"
  }
}
```

### API: Assign Printer to Counter

**Input:**
```json
{
  "counterId": 1,
  "useCasePrinters": {
    "invoice": {
      "primaryPrinterId": "PRINTER_002",
      "fallbackPrinterId": "PRINTER_003"
    },
    "kitchenOrder": {
      "primaryPrinterId": "PRINTER_001",
      "fallbackPrinterId": null
    },
    "counterToken": {
      "primaryPrinterId": "PRINTER_002",
      "fallbackPrinterId": "PRINTER_003"
    }
  }
}
```

**Output:**
```json
{
  "status": "success",
  "data": {
    "counterId": 1,
    "useCasePrinters": {...},
    "defaultPrinterId": "PRINTER_002"
  }
}
```

### API: Select Printer (for Invoice/Kitchen/Token)

**Input:**
```json
{
  "counterId": 1,
  "userId": "user_id_123",
  "useCase": "invoice"
}
```

**Output:**
```json
{
  "status": "success",
  "data": {
    "printerId": "PRINTER_002",
    "displayName": "Counter Receipt Printer",
    "type": "thermal-58mm",
    "config": {
      "silent": true,
      "printBackground": true,
      "color": false,
      "copies": 1
    },
    "selectionReason": "user_override"  // or "counter_config" or "global_default"
  }
}
```

### API: Add User Override

**Input:**
```json
{
  "userId": "user_id_123",
  "counterId": 1,
  "printerAssignments": [
    {
      "printerId": "PRINTER_001",
      "useCases": ["invoice"],
      "isPrimary": true,
      "config": null
    }
  ]
}
```

**Output:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "userId": "user_id_123",
    "counterId": 1,
    "printerAssignments": [...],
    "primaryPrinterId": "PRINTER_001"
  }
}
```

## 9. Benefits of This Design

✅ **Scalability**: Easy to add more counters and printers
✅ **Flexibility**: Multiple levels of configuration (global → counter → user)
✅ **Fallback Support**: Primary + fallback printer for reliability
✅ **Minimal Configuration**: Each counter inherits global defaults, only override as needed
✅ **User Personalization**: Individual users can have their own settings
✅ **Easy Maintenance**: Centralized printer inventory, easy to update
✅ **Future-Ready**: Supports printer discovery, health checks, usage analytics
✅ **Multi-Tenancy Ready**: Can expand to multiple organizations

## 10. Migration Strategy

For existing data:
- Keep current PaymentSettings but mark printer data as deprecated
- Create new collections with migration script
- Run migration on database
- Update backend to use new collections
- Old data remains accessible for fallback

---

**Status**: ⏳ **AWAITING APPROVAL**

Please review this plan and let me know:
1. Does this align with your POS workflow?
2. Any modifications needed to the schema?
3. Are the three-layer selection logic acceptable?
4. Should we include any additional features?
5. Timeline expectations?

Once approved, I'll proceed with implementation in this order:
1. Database schema updates
2. Backend APIs
3. Admin UI
4. Integration with existing components
5. Testing and deployment
