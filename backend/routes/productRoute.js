const express = require("express");
const multer = require("multer");
const { saveOrUpdateProduct, getProducts, getCategoryWiseItems, deleteProduct } = require("../controllers/productController");

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads/product"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.route("/")
    .post(upload.single("image"), saveOrUpdateProduct)
    .get(getProducts);

router.route("/:id").delete(deleteProduct);
router.route("/categoryWiseList").get(getCategoryWiseItems);

module.exports = router;
