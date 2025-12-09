const express = require("express");
const {
    getPaymentSettings,
    updatePaymentSettings,
    addUpiAccount,
    removeUpiAccount,
    setDefaultUpi,
    getPrinters,
    addPrinter,
    updatePrinter,
    deletePrinter,
    setDefaultPrinter,
    getDefaultPrinter,
} = require("../controllers/paymentSettingsController");
const { isUserVarified } = require("../middlewares/tokenValidator");
const { isAdminUser } = require("../middlewares/adminAccessHandler");

const router = express.Router();

// Get payment settings (admin only)
router.route("/")
    .get(isUserVarified, isAdminUser, getPaymentSettings)
    .put(isUserVarified, isAdminUser, updatePaymentSettings);

// Get payment settings (public read-only) - for QR code generation and payment UI
// No authentication required - only reads the default UPI ID (already public)
router.route("/public")
    .get(getPaymentSettings);

// Add UPI account (admin only)
router.route("/upi/add")
    .post(isUserVarified, isAdminUser, addUpiAccount);

// Remove UPI account (admin only)
router.route("/upi/:upiId")
    .delete(isUserVarified, isAdminUser, removeUpiAccount);

// Set default UPI account (admin only)
router.route("/upi/default")
    .put(isUserVarified, isAdminUser, setDefaultUpi);

// ============ PRINTER ROUTES (SIMPLIFIED - GLOBAL DEFAULT ONLY) ============

// Get all printers (admin only)
router.route("/printer/list")
    .get(isUserVarified, isAdminUser, getPrinters);

// Add new printer (admin only)
router.route("/printer/add")
    .post(isUserVarified, isAdminUser, addPrinter);

// Update printer (admin only)
router.route("/printer/:printerId")
    .put(isUserVarified, isAdminUser, updatePrinter)
    .delete(isUserVarified, isAdminUser, deletePrinter);

// Set printer as default (admin only)
router.route("/printer/:printerId/set-default")
    .put(isUserVarified, isAdminUser, setDefaultPrinter);

// Get default printer (public - used for invoice generation)
router.route("/printer/default")
    .get(getDefaultPrinter);

module.exports = router;
