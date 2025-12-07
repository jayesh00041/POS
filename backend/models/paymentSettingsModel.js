const mongoose = require("mongoose");

// UPI Account schema
const upiAccountSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    upiId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(value) {
                // Basic UPI ID validation (format: username@bank)
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]{3,}$/.test(value);
            },
            message: 'Invalid UPI ID format',
        },
    },
    businessName: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });

// Main Payment Settings schema
const paymentSettingsSchema = new mongoose.Schema({
    enableCash: {
        type: Boolean,
        default: true,
    },
    enableUpi: {
        type: Boolean,
        default: true,
    },
    upiAccounts: [upiAccountSchema],
    defaultUpiId: {
        type: String,
        default: '',
        validate: {
            validator: function(value) {
                if (!value) return true; // Allow empty string
                return this.upiAccounts.some(acc => acc.id === value);
            },
            message: 'Default UPI ID must exist in UPI accounts',
        },
    },
}, { timestamps: true });

// Add unique index to ensure only one settings document
paymentSettingsSchema.index({ }, { unique: true, sparse: true });

const PaymentSettings = mongoose.model("PaymentSettings", paymentSettingsSchema);

module.exports = PaymentSettings;
