const Category = require("../models/categoryModel");
const Product = require("../models/productModel"); // Import Product model
const createHttpError = require("http-errors");

// Save or update category
const saveOrUpdateCategory = async (req, res, next) => {
    try {
        console.log(req.body);
        const { id, name, counterNo } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = `/uploads/category/${req.file.filename}`; // Store relative path
        }

        let category;
        if (id) {
            category = await Category.findByIdAndUpdate(
                id,
                { name, counterNo, ...(imageUrl && { imageUrl }) }, // Only update image if provided
                { new: true }
            );
        } else {
            console.log({ name, imageUrl, counterNo });
            category = await Category.create({ name, imageUrl, counterNo });
        }

        // Fetch total product count for this category
        const totalProducts = await Product.countDocuments({ categoryId: category._id });

        res.status(200).json({
            status: "success",
            message: id ? "Category updated successfully" : "Category created successfully",
            data: {
                ...category.toObject(),
                imageUrl: category.imageUrl ? `${req.protocol}://${req.get("host")}${category.imageUrl}` : null,
                totalProducts,
            },
        });

    } catch (error) {
        next(createHttpError(500, "Error saving/updating category"));
    }
};

// Get all categories with product count
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        // Fetch product counts for each category
        const categoryData = await Promise.all(
            categories.map(async (category) => {
                const totalProducts = await Product.countDocuments({ categoryId: category._id });
                return {
                    ...category.toObject(),
                    imageUrl: category.imageUrl ? `${req.protocol}://${req.get("host")}${category.imageUrl}` : null,
                    totalProducts,
                };
            })
        );

        res.status(200).json({
            status: "success",
            data: categoryData,
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching categories"));
    }
};

// Delete category
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(createHttpError(400, "Category ID is required"));
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            status: "success",
            message: "Category deleted successfully",
        });

    } catch (error) {
        next(createHttpError(500, "Error deleting category"));
    }
};

module.exports = {
    saveOrUpdateCategory,
    getCategories,
    deleteCategory,
};
