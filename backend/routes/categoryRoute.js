const express = require("express");
const multer = require("multer");
const path = require("path");
const { saveOrUpdateCategory, getCategories, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/category"); // Save files in public/uploads
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({ storage });

// Routes
router.route("/")
    .post(upload.single("image"), saveOrUpdateCategory) // Upload file
    .get(getCategories);

router.route("/:id").delete(deleteCategory);

module.exports = router;
