const createHttpError = require("http-errors");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const config = require("../config/config");
const sendEmail = require("../services/mailerService");

// const registerUser = async (req, res, next) => {
//     try{
//         const { name, email, phone, password } = req.body;
//         if(!name || !email || !phone || !password){
//             next(createHttpError(400, "All fields are required"));
//         }

//         const isUserAlreadyExist = await User.findOne({ email });
//         if(isUserAlreadyExist){
//             next(createHttpError(400, "User already exist"));
//         }

//         const user = await User.create({
//             name,
//             email,
//             phone,
//             password
//         })
//         res.status(201).json({
//             status: "success",
//             data: user
//         })
//     }catch(err){
//         next(err);
//     }
// }

const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, role } = req.body;
        if (!name || !email || !phone || !role) {
            return next(createHttpError(400, "All fields are required"));
        }

        const isUserAlreadyExist = await User.findOne({ email }) || await User.findOne({ phone });
        if (isUserAlreadyExist) {
            return next(createHttpError(400, "User already exists"));
        }

        // Generate a Random Temporary Password
        const tempPassword = generatePassword();

        const user = await User.create({
            name,
            email,
            phone,
            role,
            password: tempPassword, 
        });

        // Send Onboarding Email
        // const subject = "Welcome to Our Platform 🎉";
        // const text = `Hi ${name},\n\nYour account has been successfully created!\n\nYour temporary password is: ${tempPassword}\n\nPlease change it after login.`;
        // const html = `
        //     <h2>Welcome, ${name}!</h2>
        //     <p>Your account has been successfully created.</p>
        //     <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
        //     <p>Please change it after login.</p>
        //     <p>Best Regards,<br><a href='https://jayesh00041.github.io/POS'>Jalso Park</a></p>
        // `;

        // await sendEmail([email], subject, text, html);

        res.status(201).json({
            status: "success",
            message: "User registered!",
            data: user,
        });

    } catch (err) {
        next(err);
    }
};

const generatePassword = () => {
    return "JalsoKaro123"
  };

const loginUser = async (req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;
        if(!emailOrPhone || !password){
            return next(createHttpError(400, "Both login credential and password are required"));
        }

        // Check if the input is an email or phone number
        let user;
        // Simple regex to check if input looks like an email
        const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
        
        if (isEmail) {
            user = await User.findOne({ email: emailOrPhone.toLowerCase() });
        } else {
            user = await User.findOne({ phone: emailOrPhone });
        }

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

const getAllUsers = async (req, res, next) => {
    try {   
        // Get all users
        const users = await User.find();
        
        // Remove password from each user object
        const usersWithoutPassword = users.map(user => {
            const userObject = user.toObject();
            delete userObject.password;
            return userObject;
        });
        
        res.status(200).json({
            status: "success",
            data: usersWithoutPassword
        });
    } catch (err) {
        return next(createHttpError(400, "Something went wrong"));
    }
}

const blockUnblockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if(!user){
            return next(createHttpError(400, "User not found"));
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.status(200).json({
            status: "User blocked successfully"
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
    logoutUser,
    getAllUsers,
    blockUnblockUser
}