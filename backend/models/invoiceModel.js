const mongoose = require("mongoose");
const { Schema } = mongoose;

const VariationSchema = new Schema({
    name: String,
    price: Number,
    quantity: Number,
    total: Number
});

const CartItemSchema = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    totalQuantity: Number,
    total: Number,
    variations: [VariationSchema]
});

const CounterWiseDataSchema = new Schema({
    counterNo: Number,
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variation: VariationSchema,
        quantity: Number
    }],
    counterTokenNumber: Number
});

const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    paymentMode: { type: String, required: true },
    referenceNumber: { type: String },
    cartItems: [CartItemSchema],
    totalAmount: { type: Number, required: true },
    counterWiseData: { type: Map, of: CounterWiseDataSchema },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
