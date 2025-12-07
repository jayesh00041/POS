const PaymentSettings = require("../models/paymentSettingsModel");
const createHttpError = require("http-errors");

// Get payment settings
const getPaymentSettings = async (req, res, next) => {
    try {
        let settings = await PaymentSettings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await PaymentSettings.create({
                enableCash: true,
                enableUpi: true,
                upiAccounts: [],
                defaultUpiId: '',
            });
        }

        res.status(200).json({
            status: "success",
            message: "Payment settings retrieved successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error fetching payment settings:", error);
        next(createHttpError(500, "Error fetching payment settings"));
    }
};

// Update payment settings
const updatePaymentSettings = async (req, res, next) => {
    try {
        const { enableCash, enableUpi, upiAccounts, defaultUpiId } = req.body;

        // Validate required fields
        if (enableCash === undefined || enableUpi === undefined) {
            return next(createHttpError(400, "enableCash and enableUpi fields are required"));
        }

        // Validate UPI accounts if provided
        if (upiAccounts && Array.isArray(upiAccounts)) {
            // Ensure each UPI account has required fields
            for (let account of upiAccounts) {
                if (!account.id || !account.upiId || !account.businessName) {
                    return next(createHttpError(400, "Each UPI account must have id, upiId, and businessName"));
                }

                // Validate UPI ID format
                if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]{3,}$/.test(account.upiId)) {
                    return next(createHttpError(400, `Invalid UPI ID format: ${account.upiId}`));
                }
            }

            // Validate default UPI ID if provided
            if (defaultUpiId && !upiAccounts.some(acc => acc.id === defaultUpiId)) {
                return next(createHttpError(400, "Default UPI ID must exist in UPI accounts"));
            }
        }

        let settings = await PaymentSettings.findOne();

        // If no settings exist, create new ones
        if (!settings) {
            settings = await PaymentSettings.create({
                enableCash,
                enableUpi,
                upiAccounts: upiAccounts || [],
                defaultUpiId: defaultUpiId || '',
            });

            return res.status(201).json({
                status: "success",
                message: "Payment settings created successfully",
                data: settings,
            });
        }

        // Update existing settings
        settings.enableCash = enableCash;
        settings.enableUpi = enableUpi;

        if (upiAccounts) {
            settings.upiAccounts = upiAccounts;
        }

        if (defaultUpiId !== undefined) {
            settings.defaultUpiId = defaultUpiId;
        }

        await settings.save();

        res.status(200).json({
            status: "success",
            message: "Payment settings updated successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error updating payment settings:", error);
        next(createHttpError(500, "Error updating payment settings"));
    }
};

// Add UPI account
const addUpiAccount = async (req, res, next) => {
    try {
        const { upiId, businessName } = req.body;

        // Validate required fields
        if (!upiId || !businessName) {
            return next(createHttpError(400, "upiId and businessName are required"));
        }

        // Validate UPI ID format
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]{3,}$/.test(upiId)) {
            return next(createHttpError(400, "Invalid UPI ID format. Use format like: user@app"));
        }

        let settings = await PaymentSettings.findOne();

        // If no settings exist, create new ones
        if (!settings) {
            const newId = Date.now().toString();
            settings = await PaymentSettings.create({
                enableCash: true,
                enableUpi: true,
                upiAccounts: [{ id: newId, upiId: upiId.toLowerCase(), businessName }],
                defaultUpiId: newId,
            });

            return res.status(201).json({
                status: "success",
                message: "UPI account added successfully",
                data: settings,
            });
        }

        // Check if UPI ID already exists (case-insensitive)
        if (settings.upiAccounts.some(acc => acc.upiId.toLowerCase() === upiId.toLowerCase())) {
            return next(createHttpError(400, "This UPI ID is already added"));
        }

        // Generate unique ID for the new UPI account
        const newId = Date.now().toString();

        // Add new UPI account
        settings.upiAccounts.push({
            id: newId,
            upiId: upiId.toLowerCase(),
            businessName,
        });

        // Set as default if it's the first account
        if (!settings.defaultUpiId) {
            settings.defaultUpiId = newId;
        }

        await settings.save();

        res.status(201).json({
            status: "success",
            message: "UPI account added successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error adding UPI account:", error);
        next(createHttpError(500, "Error adding UPI account"));
    }
};

// Remove UPI account
const removeUpiAccount = async (req, res, next) => {
    try {
        const { upiId } = req.params;

        if (!upiId) {
            return next(createHttpError(400, "UPI ID is required"));
        }

        const settings = await PaymentSettings.findOne();

        if (!settings) {
            return next(createHttpError(404, "Payment settings not found"));
        }

        // Check if UPI account exists
        const accountIndex = settings.upiAccounts.findIndex(
            acc => acc.upiId.toLowerCase() === upiId.toLowerCase()
        );

        if (accountIndex === -1) {
            return next(createHttpError(404, "UPI account not found"));
        }

        const removedAccount = settings.upiAccounts[accountIndex];

        // Remove UPI account
        settings.upiAccounts.splice(accountIndex, 1);

        // If removed account was default, set new default or clear it
        if (settings.defaultUpiId === removedAccount.id) {
            settings.defaultUpiId = settings.upiAccounts.length > 0 ? settings.upiAccounts[0].id : '';
        }

        await settings.save();

        res.status(200).json({
            status: "success",
            message: "UPI account removed successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error removing UPI account:", error);
        next(createHttpError(500, "Error removing UPI account"));
    }
};

// Set default UPI account
const setDefaultUpi = async (req, res, next) => {
    try {
        const { upiId } = req.body;

        if (!upiId) {
            return next(createHttpError(400, "UPI ID is required"));
        }

        const settings = await PaymentSettings.findOne();

        if (!settings) {
            return next(createHttpError(404, "Payment settings not found"));
        }

        // Find the UPI account
        const account = settings.upiAccounts.find(
            acc => acc.upiId.toLowerCase() === upiId.toLowerCase()
        );

        if (!account) {
            return next(createHttpError(404, "UPI account not found"));
        }

        settings.defaultUpiId = account.id;
        await settings.save();

        res.status(200).json({
            status: "success",
            message: "Default UPI account updated successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error setting default UPI:", error);
        next(createHttpError(500, "Error setting default UPI account"));
    }
};

module.exports = {
    getPaymentSettings,
    updatePaymentSettings,
    addUpiAccount,
    removeUpiAccount,
    setDefaultUpi,
};
