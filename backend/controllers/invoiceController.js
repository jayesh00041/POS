const Invoice = require("../models/invoiceModel");
const createHttpError = require("http-errors");

const createInvoice = async (req, res, next) => {
    try {
        const { customerName, mobileNumber, paymentMode, referenceNumber, cartItems } = req.body;
        let totalAmount = 0;

        const processedItems = cartItems.map(item => {
            const totalPrice = item.selectedVariation.price * item.quantity;
            totalAmount += totalPrice;
            return { ...item, total: totalPrice };
        });

        const invoice = await Invoice.create({
            customerName, mobileNumber, paymentMode, referenceNumber, cartItems: processedItems, totalAmount
        });

        res.status(200).json({ status: "success", data: invoice });
    } catch (error) {
        next(createHttpError(500, "Error creating invoice"));
    }
};

const getSalesTableData = async (req, res, next) => {
    try {
        const invoices = await Invoice.find().populate("cartItems.product");
        res.status(200).json({ status: "success", data: invoices });
    } catch (error) {
        next(createHttpError(500, "Error fetching sales data"));
    }
};

module.exports = { createInvoice, getSalesTableData };
