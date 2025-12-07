const express = require("express");
const {
    getPaymentSettings,
    updatePaymentSettings,
    addUpiAccount,
    removeUpiAccount,
    setDefaultUpi,
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

module.exports = router;
