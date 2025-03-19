const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserData, logoutUser, getAllUsers, blockUnblockUser } = require('../controllers/userController');
const { isUserVarified } = require("../middlewares/tokenValidator");
const { isAdminUser } = require('../middlewares/adminAccessHandler');

router.route("/register").post(isUserVarified, isAdminUser,registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/").get(isUserVarified, getUserData);
router.route("/allUsers").get(isUserVarified, isAdminUser, getAllUsers);
router.route("/blockUnblock/:id").put(isUserVarified, isAdminUser, blockUnblockUser);

module.exports = router;