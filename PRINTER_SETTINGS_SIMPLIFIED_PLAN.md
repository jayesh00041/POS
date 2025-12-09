# Printer Settings - Simplified Implementation Plan

## Overview
**Goal:** Add support for multiple printers in the system with one default printer used globally for all printing operations.

**Scope:** 
- ✅ Multiple printers can be configured
- ✅ Only ONE printer can be marked as default
- ✅ Default printer used by all users/accounts
- ❌ NO counter-level differentiation (for now)
- ❌ NO user-specific printer assignment (for now)

---

## Data Flow Architecture

```
Admin → Printer Settings UI
          ↓
    Add/Edit/Delete Printer
          ↓
    Backend API (POST/PUT/DELETE)
          ↓
    MongoDB (printers array)
          ↓
    When creating invoice:
    - Fetch default printer from DB
    - Send printer config in invoice response
    - Frontend passes to print handler
          ↓
    Receipt prints with printer config
```

---

## Database Schema Design

### PaymentSettingsModel (SIMPLIFIED)

```javascript
paymentSettingsSchema = {
  // Existing fields (keep as is)
  companyName: String,
  companyPhone: String,
  upiId: String,
  
  // NEW: Printer Management
  printers: [
    {
      _id: ObjectId,
      name: String,                    // e.g., "Main Counter Printer"
      type: String,                    // thermal-80mm, thermal-58mm, standard-a4
      deviceName: String,              // e.g., "Brother HL-B2080DW series Printer"
      isDefault: Boolean,              // Only ONE printer can be true
      silent: Boolean,                 // Print without dialog
      printBackground: Boolean,        // Print background colors
      color: Boolean,                  // Color printing (if supported)
      copies: Number,                  // Default copies (1-5)
      isActive: Boolean,               // Soft delete / enable-disable
      createdAt: Date,
      updatedAt: Date
    }
  ],
  
  // Convenience field for quick access
  defaultPrinterId: ObjectId          // Pointer to the default printer
}
```

**Key Points:**
- `printers` array stores all configured printers
- `isDefault: true` flag marks THE active printer (only one should have this)
- `defaultPrinterId` provides quick access without searching array
- All fields except `name` and `deviceName` have defaults
- `isActive` allows disabling without deletion

---

## API Endpoints Design

### Base URL: `/api/payment-settings`

#### 1. **GET /printer/list** ⬅ Get all printers
```
Response:
{
  status: "success",
  data: {
    printers: [
      { _id, name, type, isDefault, isActive, ... },
      ...
    ],
    defaultPrinterId: "xxx"
  }
}
```

#### 2. **POST /printer/add** ➕ Add new printer
```
Request Body:
{
  name: "Kitchen Printer",
  type: "thermal-80mm",
  deviceName: "Brother HL-B2080DW",
  silent: true,
  printBackground: false,
  color: false,
  copies: 1
}

Response:
{
  status: "success",
  data: {
    printer: { _id, name, type, ... }
  }
}
```

#### 3. **PUT /printer/:printerId** ✏️ Update printer
```
Request Body:
{
  name: "Updated Name",
  type: "thermal-80mm",
  copies: 2,
  ... (any field can be updated)
}

Response:
{
  status: "success",
  data: {
    printer: { _id, name, ... }
  }
}
```

#### 4. **PUT /printer/:printerId/set-default** ⭐ Set as default
```
Request Body: {} (empty)

Logic:
1. Find printer by ID
2. Set all other printers' isDefault = false
3. Set this printer's isDefault = true
4. Update defaultPrinterId in main settings
5. Return updated printer

Response:
{
  status: "success",
  data: {
    printer: { _id, name, isDefault: true, ... }
  }
}
```

#### 5. **DELETE /printer/:printerId** 🗑️ Delete printer
```
Logic:
1. Check if printer is default
   - If yes: CANNOT DELETE (error)
   - If no: DELETE
2. Remove from printers array
3. Return success

Response:
{
  status: "success",
  message: "Printer deleted successfully"
}

Error if default:
{
  status: "error",
  message: "Cannot delete default printer. Set another printer as default first."
}
```

#### 6. **GET /printer/default** 📥 Get default printer
```
Response:
{
  status: "success",
  data: {
    printer: { _id, name, type, deviceName, silent, printBackground, color, copies }
  }
}
```

---

## Frontend UI Design

### Location: `src/views/admin/settings/PrinterSettingsPage.tsx`

**Single Tab Interface (No tabs needed):**

```
┌─────────────────────────────────────────────────┐
│ PRINTER SETTINGS                                │
│                                                 │
│ Default Printer: Brother HL-B2080DW ⭐          │
│                                                 │
├─────────────────────────────────────────────────┤
│ [+ Add Printer]                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Printer List (Table)                            │
│ ─────────────────────────────────────────────  │
│ Name  │ Type  │ Device │ Status │ Default │ Actions
│ ─────────────────────────────────────────────  │
│ Main  │ 80mm  │ Brother│ Active │ ⭐      │ Edit | Delete
│ Back  │ 58mm  │ Epson  │ Active │ -       │ Edit | Delete | Set Default
│ Guest │ A4    │ Canon  │ Inactive│ -       │ Edit | Delete | Activate
│                                                 │
└─────────────────────────────────────────────────┘
```

**Features:**
- Show default printer at top with ⭐ badge
- Table with all printers
- Quick "Set as Default" button (if not already default)
- Edit modal for updating printer details
- Delete button (disabled if default)
- Add printer modal

---

## Controller Functions (Backend)

### `paymentSettingsController.js`

```javascript
// 1. List all printers
async function getPrinters(req, res) {
  const settings = await PaymentSettings.findOne();
  return res.json({
    status: "success",
    data: {
      printers: settings.printers,
      defaultPrinterId: settings.defaultPrinterId
    }
  });
}

// 2. Add printer
async function addPrinter(req, res) {
  const { name, type, deviceName, silent, printBackground, color, copies } = req.body;
  
  // Validate required fields
  if (!name || !deviceName) {
    return res.status(400).json({ status: "error", message: "Name and Device Name required" });
  }
  
  const newPrinter = {
    _id: new ObjectId(),
    name,
    type: type || 'thermal-80mm',
    deviceName,
    silent: silent !== false,
    printBackground: printBackground === true,
    color: color === true,
    copies: copies || 1,
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // If first printer, make it default
  const settings = await PaymentSettings.findOne();
  if (!settings.printers || settings.printers.length === 0) {
    newPrinter.isDefault = true;
  }
  
  settings.printers.push(newPrinter);
  if (newPrinter.isDefault) {
    settings.defaultPrinterId = newPrinter._id;
  }
  
  await settings.save();
  
  return res.json({ status: "success", data: { printer: newPrinter } });
}

// 3. Update printer
async function updatePrinter(req, res) {
  const { printerId } = req.params;
  const updates = req.body;
  
  const settings = await PaymentSettings.findOne();
  const printer = settings.printers.id(printerId);
  
  if (!printer) {
    return res.status(404).json({ status: "error", message: "Printer not found" });
  }
  
  // Prevent changing isDefault via update (use dedicated endpoint)
  delete updates.isDefault;
  
  Object.assign(printer, { ...updates, updatedAt: new Date() });
  await settings.save();
  
  return res.json({ status: "success", data: { printer } });
}

// 4. Set as default
async function setDefaultPrinter(req, res) {
  const { printerId } = req.params;
  
  const settings = await PaymentSettings.findOne();
  const printer = settings.printers.id(printerId);
  
  if (!printer) {
    return res.status(404).json({ status: "error", message: "Printer not found" });
  }
  
  // Set all to false
  settings.printers.forEach(p => p.isDefault = false);
  
  // Set this one to true
  printer.isDefault = true;
  settings.defaultPrinterId = printerId;
  
  await settings.save();
  
  return res.json({ status: "success", data: { printer } });
}

// 5. Delete printer
async function deletePrinter(req, res) {
  const { printerId } = req.params;
  
  const settings = await PaymentSettings.findOne();
  const printer = settings.printers.id(printerId);
  
  if (!printer) {
    return res.status(404).json({ status: "error", message: "Printer not found" });
  }
  
  // Prevent deletion of default printer
  if (printer.isDefault) {
    return res.status(400).json({
      status: "error",
      message: "Cannot delete default printer. Set another printer as default first."
    });
  }
  
  settings.printers.id(printerId).deleteOne();
  await settings.save();
  
  return res.json({ status: "success", message: "Printer deleted successfully" });
}

// 6. Get default printer (for invoice creation)
async function getDefaultPrinter(req, res) {
  const settings = await PaymentSettings.findOne();
  const defaultPrinter = settings.printers.find(p => p.isDefault === true);
  
  if (!defaultPrinter) {
    return res.status(404).json({ status: "error", message: "No default printer set" });
  }
  
  return res.json({ status: "success", data: { printer: defaultPrinter } });
}
```

---

## Routes

### `paymentSettingsRoute.js`

```javascript
// Add these routes
router.get('/printer/list', getPrinters);
router.post('/printer/add', isAdminUser, addPrinter);
router.put('/printer/:printerId', isAdminUser, updatePrinter);
router.put('/printer/:printerId/set-default', isAdminUser, setDefaultPrinter);
router.delete('/printer/:printerId', isAdminUser, deletePrinter);
router.get('/printer/default', getDefaultPrinter);  // No auth needed
```

---

## Invoice Integration

### When creating invoice (invoiceController.js):

```javascript
async function createInvoice(req, res) {
  // ... existing code ...
  
  // Get default printer
  const settings = await PaymentSettings.findOne();
  const printerConfig = settings.printers.find(p => p.isDefault === true);
  
  // If no default printer, still allow invoice creation but notify user
  const response = {
    status: "success",
    invoice: invoiceData,
    printerConfig: printerConfig || null  // Send null if not configured
  };
  
  return res.json(response);
}
```

---

## Frontend Components Changes

### `CartComponent.tsx` - Already updated
```javascript
// Receives printerConfig from API response
// Passes to InvoicePopup for printing
```

### `InvoicePopup.tsx` - Already updated
```javascript
// Receives printerConfig prop
// Uses it for printing
// Falls back to browser print if not available
```

---

## Implementation Checklist

### Phase 1: Database Schema ✅
- [ ] Update PaymentSettingsModel with printers array and defaultPrinterId
- [ ] Create migration if needed

### Phase 2: Backend API ✅
- [ ] Implement 6 controller functions
- [ ] Add 6 routes with proper middleware
- [ ] Test all endpoints with Postman/API client

### Phase 3: Frontend UI ✅
- [ ] Create simplified PrinterSettingsPage (single tab)
- [ ] Add printer CRUD modals
- [ ] Implement "Set as Default" functionality
- [ ] Show default printer at top
- [ ] Add HTTP route functions for API calls

### Phase 4: Integration ✅
- [ ] Update invoiceController to fetch and send printer config
- [ ] Test invoice creation with printer config
- [ ] Verify InvoicePopup receives and uses printer config

### Phase 5: Testing ✅
- [ ] Add 3-4 test printers
- [ ] Switch default printer
- [ ] Create invoice and verify printer config in response
- [ ] Test printing with different configurations
- [ ] Test edge cases (no default printer, etc.)

---

## Error Handling

| Scenario | Response |
|----------|----------|
| Printer not found | 404 - "Printer not found" |
| Try to delete default | 400 - "Cannot delete default printer..." |
| No default set | 404 - "No default printer set" |
| Missing required fields | 400 - "Name and Device Name required" |
| Invalid printer ID | 400 - "Invalid printer ID" |

---

## Future Enhancements (NOT NOW)
- Counter-level printer assignment
- User-specific printer preferences
- Printer health check / connectivity test
- Print job queue management
- Printer error logging
- Multiple default printers for different use cases

---

## Summary

**What we're building:**
✅ Global printer configuration system
✅ Multiple printers with one active/default
✅ Admin UI to manage printers
✅ Automatic printer config in invoice response
✅ Clean, minimal configuration interface

**Scope:**
- ✅ Multiple printers
- ✅ Default printer selection
- ✅ Admin management UI
- ❌ Counter differentiation
- ❌ User-specific assignment
- ❌ Complex configurations

**Timeline:** 2-3 hours for complete implementation and testing

---

**READY FOR APPROVAL?** 
Please review and confirm:
1. ✅ Database schema design acceptable?
2. ✅ API endpoints cover all needs?
3. ✅ UI design meets requirements?
4. ✅ Integration approach correct?
5. ✅ Proceed with implementation?
