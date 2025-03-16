const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");

const saveOrUpdateProduct = async (req, res, next) => {
    try {
        const { id, name, categoryId, price, counterNo, variationType, variations } = req.body;
        let imageUrl;

        if (req.file) {
            // Store only relative path
            imageUrl = `/uploads/product/${req.file.filename}`;
        }

        // Validate category existence
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return next(createHttpError(400, "Invalid category"));
        }

        let parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;

        // Calculate price range if variations exist
        let finalPrice = price; 
        if (parsedVariations && parsedVariations.length > 0) {
            const prices = parsedVariations.map(variation => variation.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            finalPrice = `₹${minPrice}-${maxPrice}`;
        }

        let product;
        if (id) {
            product = await Product.findByIdAndUpdate(
                id,
                { name, imageUrl, categoryId, price: finalPrice, counterNo, variationType, variations: parsedVariations },
                { new: true }
            );
        } else {
            product = await Product.create({ 
                name, 
                imageUrl, 
                categoryId, 
                price: finalPrice, 
                counterNo, 
                variationType,
                variations: parsedVariations 
            });
        }

        res.status(200).json({
            status: "success",
            message: id ? "Product updated successfully" : "Product created successfully",
            data: {
                ...product.toObject(),
                imageUrl: product.imageUrl ? `${req.protocol}://${req.get("host")}${product.imageUrl}` : null,
            },
        });
    } catch (error) {
        next(createHttpError(500, "Error saving/updating product"));
    }
};

// Fetch category-wise products using categoryId
const getCategoryWiseItems = async (req, res, next) => {
    try {
        const products = await Product.find().populate("categoryId", "name");
        const categories = {};

        products.forEach(product => {
            const categoryName = product.categoryId.name;
            if (!categories[categoryName]) {
                categories[categoryName] = [];
            }

            // Convert stored relative path to absolute path
            const absoluteImageUrl = product.imageUrl
                ? `${req.protocol}://${req.get("host")}${product.imageUrl}`
                : null;

            categories[categoryName].push({
                id: product._id,
                name: product.name,
                price: product.price,
                counterNo: product.counterNo,
                variationType: product.variationType,
                variations: product.variations,
                imageUrl: absoluteImageUrl, // Return absolute path
            });
        });

        res.status(200).json({ 
            status: "success", 
            categories: Object.entries(categories).map(([name, products]) => ({ name, products })) 
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching category-wise products"));
    }
};

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find().populate("categoryId", "name");

        const updatedProducts = products.map(product => ({
            ...product._doc, 
            imageUrl: product.imageUrl
                ? `${req.protocol}://${req.get("host")}${product.imageUrl}`
                : null, // Convert to absolute
        }));

        res.status(200).json({ status: "success", data: updatedProducts });
    } catch (error) {
        next(createHttpError(500, "Error fetching products"));
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return next(createHttpError(400, "Product ID is required"));

        const product = await Product.findByIdAndDelete(id);
        if (!product) return next(createHttpError(404, "Product not found"));

        res.status(200).json({ status: "success", message: "Product deleted successfully" });
    } catch (error) {
        next(createHttpError(500, "Error deleting product"));
    }
};

module.exports = { saveOrUpdateProduct, getProducts, getCategoryWiseItems, deleteProduct };
