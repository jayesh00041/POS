const express = require('express');
const router = express.Router();
const { createInvoice, getSalesTableData } = require('../controllers/invoiceController');
const { isUserVarified } = require("../middlewares/tokenValidator");

router.route("/").post(isUserVarified, createInvoice);
router.route("/").get(isUserVarified, getSalesTableData);

module.exports = router;