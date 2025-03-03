const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: false },
    counterNo: { type: String, required: true },
    totalProducts: { type: Number, required: false }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
