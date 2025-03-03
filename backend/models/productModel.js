const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: String, required: true },
    counterNo: { type: Number, required: true },
    variations: [variationSchema]
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
