const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserData } = require('../controllers/userController');
const { isUserVarified } = require("../middlewares/tokenValidator");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/").get(isUserVarified, getUserData);

module.exports = router;