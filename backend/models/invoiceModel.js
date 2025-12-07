const mongoose = require("mongoose");
const { Schema } = mongoose;

const VariationSchema = new Schema({
    name: String,
    price: Number,
    quantity: Number,
    total: Number
});

const CartItemSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Renamed `id` to `product`
    productName: String,
    totalQuantity: Number,
    total: Number,
    variations: [VariationSchema]
});

const CounterWiseDataSchema = new Schema({
    counterNo: Number,
    counterTokenNumber: Number,
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
        productName: String, // Added product name
        totalQuantity: Number, // Added total quantity
        total: Number, // Added total amount per product
        variations: [VariationSchema] // Changed from single object to array
    }]
});

const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String },
    mobileNumber: { type: String },
    paymentMode: { type: String, required: true },
    referenceNumber: { type: String },
    cartItems: [CartItemSchema],
    totalAmount: { type: Number, required: true },
    counterWiseData: [CounterWiseDataSchema], 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
