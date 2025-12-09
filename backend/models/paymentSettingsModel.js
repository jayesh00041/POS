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

// Simplified Printer Configuration schema (SINGLE GLOBAL DEFAULT)
const printerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['thermal-80mm', 'thermal-58mm', 'standard-a4'],
        default: 'thermal-80mm',
    },
    silent: {
        type: Boolean,
        default: true,
    },
    printBackground: {
        type: Boolean,
        default: false,
    },
    color: {
        type: Boolean,
        default: false,
    },
    copies: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
    },
    deviceName: {
        type: String,
        required: true,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
        description: 'Only ONE printer can have this as true',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });

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
    printers: [printerSchema],
    defaultPrinterId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        description: 'Reference to the default printer (only one can be set)',
    },
}, { timestamps: true });

// Add unique index to ensure only one settings document
paymentSettingsSchema.index({ }, { unique: true, sparse: true });

const PaymentSettings = mongoose.model("PaymentSettings", paymentSettingsSchema);

module.exports = PaymentSettings;
