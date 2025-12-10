# How to Add Your First Printer

## Step 1: Open Printer Management
- Go to Settings → Printer (in the left sidebar)
- You should see "Printer Management" with an "Add Printer" button

## Step 2: Click "Add Printer" Button
- Click the blue "+ Add Printer" button in the top right

## Step 3: Fill in the Form

### Required Fields:
1. **Printer Name** - Give your printer a friendly name
   - Example: "Front Desk", "Counter", "Main Printer"

2. **Device Name** - Your Windows printer device name
   - On Windows: 
     - Go to Settings → Devices → Printers & scanners
     - Find your printer name (this is the device name)
     - Format: `\\COMPUTERNAME\PrinterName` OR just the printer name
   - Example: `\\DESKTOP-PC\Thermal-Printer-1`

### Optional Settings:
3. **Printer Type** - Select from dropdown
   - Thermal 80mm (most common for receipts)
   - Thermal 58mm (smaller thermal)
   - Standard A4 (regular office printer)

4. **Copies** - Number of copies to print (1-10)
   - Default: 1

5. **Silent Printing** - Toggle on/off
   - ON (default): Don't show print dialog
   - OFF: Show print dialog before printing

6. **Print Background** - Toggle on/off
   - ON: Include background colors
   - OFF (default): Print without background

7. **Color Printing** - Toggle on/off
   - ON: Print in color
   - OFF (default): Print in black & white

## Step 4: Save the Printer
- Click "Add" button at the bottom
- First printer added will automatically be set as **Default**

## Step 5: View Your Printers
- You'll see the printer in the table
- Badge showing "Default" status
- "Active" status badge
- Edit, Set as Default, and Delete buttons

---

## To Set a Printer as Default
1. Click the ✓ (check) icon on any non-default printer
2. That printer becomes the default
3. Previous default is unset

## To Edit a Printer
1. Click the ✏️ (edit) icon
2. Modify any settings
3. Click "Update"

## To Delete a Printer
1. First, make sure it's not the default printer
2. If it's default, set another as default first
3. Click the 🗑️ (trash) icon
4. Printer is deleted

---

## Finding Your Device Name on Windows

### Method 1: Settings
1. Settings → Devices → Printers & scanners
2. Find your printer in the list
3. Click on it
4. Copy the name (this is your device name)

### Method 2: Control Panel
1. Control Panel → Devices and Printers
2. Right-click on your printer
3. Select Properties
4. Copy the full name

### Method 3: Command Prompt
```cmd
wmic printconfig list brief
```
Look for your printer name in the output

---

## Example Printer Configuration

**Name:** Front Desk Thermal  
**Type:** Thermal 80mm  
**Device Name:** \\DESKTOP-MAIN\Thermal-80mm-1  
**Silent:** ON  
**Background:** OFF  
**Color:** OFF  
**Copies:** 1  

---

## Troubleshooting

### "Cannot find device name"
- Double-check the printer name on Windows
- Make sure the printer is connected and installed
- Try restarting the printer

### "Failed to add printer"
- Check all required fields are filled
- Verify device name is correct
- Make sure you're an admin user

### "Cannot delete printer"
- That's the default printer
- Set another printer as default first
- Then delete it

### "No printers showing in table"
- Refresh the page (F5)
- Make sure you've clicked "Add" button
- Check browser console for errors

---

## Next Steps

After adding your first printer:

1. **Create Invoice** - Invoices will now print to this default printer
2. **Add More Printers** - Add additional printers for other locations/uses
3. **Change Default** - Set which printer is used for all invoices
4. **Customize Settings** - Adjust print quality, colors, etc. as needed

---

For more details, see `PRINTER_SYSTEM_QUICK_REFERENCE.md`
