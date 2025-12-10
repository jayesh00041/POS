const jwt = require("jsonwebtoken");
const config = require("../config/config");
const createHttpError = require("http-errors");
const User = require("../models/userModel")

async function isUserVarified(req, res, next){

    try{
        const { accessToken } = req.cookies;
        if(!accessToken){
            return next(createHttpError(401, "accessToken is required"));
        }
        const decodedAccessToken = jwt.verify(accessToken, config.jwtSecret);

        const user = await User.findById(decodedAccessToken.id);
        if(!user){
            next(createHttpError(401, "User not found"));
        }
    
        req.user = user;
        next();
    } catch (error) {
        next(createHttpError(401, "Invalid accessToken"));
    }
}

module.exports = { isUserVarified };