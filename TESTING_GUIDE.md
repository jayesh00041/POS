# Payment Settings Integration - Testing Guide

## Quick Start Testing

### Prerequisites

1. **Backend Running:**
   ```powershell
   cd g:\POS\backend
   npm start
   ```
   - Server should start on `http://localhost:8000`
   - MongoDB connection should be active

2. **Frontend Running:**
   ```powershell
   cd g:\POS\frontend
   npm run dev
   ```
   - Application should start on `http://localhost:5173` (or similar)

3. **Admin User Account:**
   - Login with admin credentials
   - Ensure user has `isAdmin: true` in database

## Test Scenarios

### Scenario 1: Initial Load Test

**Steps:**
1. Navigate to Settings page (Admin Sidebar → Settings)
2. Click on "Payments" tab
3. Observe component loading

**Expected Results:**
- ✅ Spinner appears briefly
- ✅ Settings load from backend
- ✅ Cash toggle shows current state
- ✅ UPI toggle shows current state
- ✅ Existing UPI accounts display (if any)

**Failed Result:**
- ❌ Spinner shows indefinitely → Check backend connection
- ❌ Error toast appears → Check error message
- ❌ Page refreshes to login → Check JWT token

---

### Scenario 2: Add UPI Account

**Steps:**
1. Go to Settings → Payments tab
2. Ensure UPI is enabled
3. In "Add New UPI Account" section:
   - Enter UPI ID: `test@googleplay`
   - Enter Business Name: `Test Store`
4. Click "Add UPI Account" button
5. Observe the result

**Expected Results:**
- ✅ Button shows loading spinner
- ✅ Form inputs disabled during save
- ✅ Success toast appears: "UPI account added successfully"
- ✅ New account appears in the list below
- ✅ Input fields cleared
- ✅ New account automatically set as default (if first account)

**Failed Results:**
- ❌ Error toast: "Invalid UPI ID format" → Use valid UPI format (name@app)
- ❌ Error toast: "Duplicate UPI" → UPI ID already exists
- ❌ Error toast: "Failed to add UPI account" → Check backend logs
- ❌ 401 Error → Check JWT token validity

---

### Scenario 3: Set Default UPI

**Prerequisites:**
- At least 2 UPI accounts added

**Steps:**
1. Go to Settings → Payments tab
2. In UPI Accounts section, see the list of accounts
3. Click on the radio button for a different account
4. Observe the update

**Expected Results:**
- ✅ Radio button changes selection
- ✅ "Default" badge moves to new selection
- ✅ Success toast: "Default UPI updated successfully"
- ✅ Change persists after page refresh

**Failed Results:**
- ❌ Radio button won't select → Check `isSaving` state
- ❌ Error toast appears → Check backend validation
- ❌ Default not persisting → Check MongoDB update

---

### Scenario 4: Delete UPI Account

**Prerequisites:**
- At least 2 UPI accounts added

**Steps:**
1. Go to Settings → Payments tab
2. In UPI Accounts section, locate an account
3. Click the red trash/delete icon
4. Observe the result

**Expected Results:**
- ✅ Account is removed from list
- ✅ Info toast: "UPI account removed successfully"
- ✅ If deleted account was default, another is auto-selected
- ✅ Change persists after refresh

**Failed Results:**
- ❌ Delete button disabled with 1 account → Expected behavior (can't delete only account)
- ❌ Error toast appears → Check backend logs
- ❌ Account still in list after deletion → Refresh page

---

### Scenario 5: Enable/Disable Cash Payment

**Steps:**
1. Go to Settings → Payments tab
2. Find "Cash Payment" section
3. Toggle the switch OFF
4. Observe the change

**Expected Results:**
- ✅ Switch animation smooth
- ✅ API call made to update settings
- ✅ Change persists after refresh
- ✅ Next invoice creation should reflect this setting

**Toggle back ON:**
- ✅ Same process, but switch turns green

---

### Scenario 6: Enable/Disable UPI Payment

**Steps:**
1. Go to Settings → Payments tab
2. Find "UPI Payment" section
3. Toggle the switch OFF
4. Observe the result

**Expected Results:**
- ✅ Switch animation smooth
- ✅ UPI Accounts section disappears (collapsed)
- ✅ API call made
- ✅ Change persists

**Toggle back ON:**
- ✅ UPI Accounts section reappears
- ✅ All previously added accounts still there

---

### Scenario 7: Form Validation

**Steps:**
1. Go to Settings → Payments tab
2. Try to add UPI without UPI ID:
   - Leave UPI ID empty
   - Enter Business Name: "Test"
   - Click Add
3. Try to add UPI without Business Name:
   - Enter UPI ID: `test@app`
   - Leave Business Name empty
   - Click Add

**Expected Results:**
- ✅ Validation error toast: "Please enter both UPI ID and business name"
- ✅ API not called
- ✅ Form stays open for correction

---

### Scenario 8: Invalid UPI Format

**Steps:**
1. Go to Settings → Payments tab
2. Enter invalid UPI format:
   - UPI ID: `invalid`
   - Business Name: `Test`
   - Click Add

**Expected Results:**
- ✅ Error toast with backend validation message
- ✅ Account not added
- ✅ Error message guides user to fix format

**Valid UPI Formats:**
- `user@googleplay`
- `shop@paytm`
- `business@ybl`
- `merchant@okaxis`

---

### Scenario 9: Cancel Changes

**Steps:**
1. Go to Settings → Payments tab
2. Make any change (toggle, add UPI, etc.)
3. Notice "Cancel" button becomes enabled
4. Click Cancel button
5. Observe the result

**Expected Results:**
- ✅ All local changes reverted
- ✅ Form resets to original state
- ✅ Input fields cleared
- ✅ No API calls made

---

### Scenario 10: Authentication Error

**Steps:**
1. Backend running, Frontend running
2. Clear browser cookies/localStorage
3. Try to access Settings → Payments
4. Observe the result

**Expected Results:**
- ✅ 401 Unauthorized error
- ✅ Automatic redirect to login page
- ✅ Error message shown to user

---

### Scenario 11: Network Error

**Steps:**
1. Backend running, Frontend running, Settings page open
2. Stop backend server
3. Try any operation (add UPI, toggle, etc.)
4. Observe the result

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Error toast after timeout: "Failed to..." or network error
- ✅ UI doesn't hang or freeze
- ✅ Page still usable

---

### Scenario 12: Loading States

**Steps:**
1. Open Settings → Payments tab
2. Observe initial load
3. Click "Add UPI Account" button
4. Observe button state during save

**Expected Results:**
- ✅ Page load: Spinner in center
- ✅ Button click: Button shows spinner, text hidden
- ✅ Form inputs: Disabled during save
- ✅ All interactive elements disabled except cancel

---

## Browser DevTools Testing

### Network Tab Testing

1. **Check API Calls:**
   ```
   GET /api/payment-settings/
   POST /api/payment-settings/upi/add
   PUT /api/payment-settings/upi/default
   DELETE /api/payment-settings/upi/:id
   PUT /api/payment-settings/
   ```

2. **Verify Headers:**
   - Authorization: `Bearer <token>`
   - Content-Type: `application/json`

3. **Verify Response:**
   ```json
   {
     "status": "success",
     "message": "...",
     "data": { ... }
   }
   ```

### Console Tab Testing

**Expected Logs:**
```javascript
// On successful operations
undefined

// On errors
Error: Failed to add UPI account
```

**Check for Warnings:**
- React hook warnings
- TypeScript compilation errors
- Missing dependencies

### Application Tab (DevTools)

**Check Storage:**
- localStorage should NOT have payment settings
- Only JWT token and user data stored

---

## Performance Testing

### Load Time
- Initial page load: < 1 second
- First paint: < 500ms
- API response time: < 200ms

### Concurrent Operations
- Add UPI while another operation pending → Should queue
- Multiple toggles → Should handle gracefully

### Memory Usage
- No memory leaks on component unmount
- State cleanup on navigation away

---

## Database Testing

### MongoDB Verification

1. **Check Document Created:**
   ```mongodb
   db.paymentsettings.findOne({})
   ```

2. **Verify Document Structure:**
   ```json
   {
     "_id": ObjectId(...),
     "enableCash": true,
     "enableUpi": true,
     "upiAccounts": [
       {
         "id": "...",
         "upiId": "test@googleplay",
         "businessName": "Test Store"
       }
     ],
     "defaultUpiId": "...",
     "createdAt": ISODate(...),
     "updatedAt": ISODate(...)
   }
   ```

3. **Verify Uniqueness:**
   ```mongodb
   db.paymentsettings.countDocuments({})
   // Should return 1 (singleton pattern)
   ```

---

## Security Testing

### Admin-Only Access

1. **Login as Non-Admin:**
   - Try to access Settings page
   - Expected: Should see 401 error or redirect

2. **Login as Admin:**
   - Access Settings page
   - Expected: Full access, no restrictions

### Token Validation

1. **Expired Token:**
   - Wait for token to expire
   - Try operation
   - Expected: Auto-logout, redirect to login

2. **Invalid Token:**
   - Manually modify localStorage token
   - Try operation
   - Expected: 401 error, auto-logout

---

## Mobile Testing

### Responsive Design

- [ ] Settings page responsive on mobile
- [ ] Radio buttons easily tappable
- [ ] Delete button easily accessible
- [ ] Keyboard doesn't cover inputs
- [ ] Toasts visible on small screens
- [ ] Loading spinner centered
- [ ] Forms stack vertically

### Touch Events

- [ ] Toggles work with touch
- [ ] Buttons have adequate touch target
- [ ] No hover-only interactions

---

## Edge Cases

### Edge Case 1: Only 1 UPI Account
- Delete button should be disabled
- Cannot delete last UPI
- Should show appropriate message

### Edge Case 2: No UPI Accounts
- Show empty state message
- "Add New UPI Account" still works
- Dynamically show accounts section when first added

### Edge Case 3: Rapid Successive Clicks
- Multiple add clicks shouldn't create duplicates
- Should show loading during first request
- Subsequent clicks should be ignored

### Edge Case 4: Page Refresh During Save
- Backend should process the request
- Frontend reload shows updated state
- No data loss

### Edge Case 5: Very Long Business Names
- Should truncate gracefully in UI
- Full name visible in tooltip
- No layout breaking

---

## Test Report Template

```
TEST DATE: __________
TESTER: ___________
ENVIRONMENT: Development / Staging / Production

Test Scenario: ________________
Result: ✅ PASS / ❌ FAIL
Duration: __________
Notes: 

---

Test Scenario: ________________
Result: ✅ PASS / ❌ FAIL
Duration: __________
Notes: 

---

SUMMARY:
- Total Tests: __
- Passed: __
- Failed: __
- Pass Rate: __%

BLOCKERS:

FOLLOW-UP ITEMS:
```

---

## Deployment Sign-Off

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Network requests correct
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Security validated
- [ ] Database synced
- [ ] Error handling works
- [ ] Documentation complete
- [ ] Ready for production

**Approved By:** ___________
**Date:** ___________

---

## Quick Regression Test (5 minutes)

```
1. Login → Settings → Payments [30s]
2. Add UPI → Verify appears [60s]
3. Set as default → Verify updates [30s]
4. Delete UPI → Verify removed [30s]
5. Refresh page → Verify persists [30s]
6. Toggle Cash → Verify updates [30s]
7. Logout → Verify auth works [30s]

TOTAL TIME: ~5 minutes
If all ✅, system ready for production
```
