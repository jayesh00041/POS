const express = require("express");
const { getSalesOverview, getProductInsights, getUserStats } = require("../controllers/dashboardController");
const { isUserVarified } = require("../middlewares/tokenValidator"); // Middleware for authentication

const router = express.Router();

router.get("/sales-overview", isUserVarified, getSalesOverview);
router.get("/product-insights", isUserVarified, getProductInsights);
router.get("/user-stats", isUserVarified, getUserStats);

module.exports = router;
