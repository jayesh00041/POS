const createHttpError = require("http-errors");

async function isAdminUser(req, res, next){

    try{
        const user = req.user;
        if(!user || user.isBlocked){
            next(createHttpError(401, "User not found"));
        }

        if(!user.role === "admin" ){
            return next(createHttpError(401, "admin can access this route"));
        }
        
        next();
    } catch (error) {
        next(createHttpError(401, "Invalid accessToken"));
    }
}

module.exports = { isAdminUser };