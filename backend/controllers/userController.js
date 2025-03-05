const createHttpError = require("http-errors");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const config = require("../config/config");

const registerUser = async (req, res, next) => {
    try{
        const { name, email, phone, password } = req.body;
        if(!name || !email || !phone || !password){
            next(createHttpError(400, "All fields are required"));
        }

        const isUserAlreadyExist = await User.findOne({ email });
        if(isUserAlreadyExist){
            next(createHttpError(400, "User already exist"));
        }

        const user = await User.create({
            name,
            email,
            phone,
            password
        })
        res.status(201).json({
            status: "success",
            data: user
        })
    }catch(err){
        next(err);
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return next(createHttpError(400, "All fields are required"));
        }

        const user = await User.findOne({ email });
        if(!user){
            return next(createHttpError(400, "User not found"));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(isPasswordValid === false){
            return next(createHttpError(400, "Invalid password"));
        }

        const accessToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "1d" });

        res.cookie("accessToken", accessToken, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        
        return res.status(200).json({
            status: "User logged in successfully",
            data: user
        });
    } catch(err) {
        return next(err);
    }
}

const getUserData = async (req, res, next) => {
    try {
        console.log("req.user", req.user);
        const user = await User.findById(req.user._id);
        res.status(200).json({
            status: "success",
            data: user
        })
    } catch (err) {
        return next(createHttpError(400, "Something went wrong"));
    }
}

const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("accessToken");
        res.status(200).json({
            status: "User logged out successfully"
        })
    } catch (err) {
        return next(createHttpError(400, "Something went wrong"));
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserData,
    logoutUser
}