const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    paymentMode: { type: String, required: true },
    referenceNumber: { type: String, required: false },
    cartItems: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        selectedVariation: { name: String, price: Number },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true }
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;