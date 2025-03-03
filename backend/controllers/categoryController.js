const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");

// Save or update category
const saveOrUpdateCategory = async (req, res, next) => {
    try {
        console.log(req.body);
        const { id, name, counterNo } = req.body;
        let imageUrl;

        if (req.file) {
            const filePath = `/uploads/category/${req.file.filename}`;
            imageUrl = `${req.protocol}://${req.get("host")}${filePath}`; // Generate full URL
        }
        let category;
        if (id) {
            category = await Category.findByIdAndUpdate(
                id,
                { name, imageUrl, counterNo },
                { new: true }
            );
        } else {
            console.log({name, imageUrl, counterNo});
            category = await Category.create({ name, imageUrl, counterNo });
        }
        

        res.status(200).json({
            status: "success",
            message: id ? "Category updated successfully" : "Category created successfully",
            data: category,
        });

    } catch (error) {
        next(createHttpError(500, "Error saving/updating category"));
    }
};

// Get all categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            status: "success",
            data: categories,
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
