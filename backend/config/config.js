require("dotenv").config();

console.log(`Hii config Setup ${process.env.PORT}`);
const config = Object.freeze({
    port: process.env.PORT || 3000,
    db_uri : process.env.DB_URI || "mongodb://localhost:27017/test",
    nodeEnv : process.env.NODE_ENV || "development",
    jwtSecret : process.env.JWT_SECRET,
    frontendUrl : process.env.FRONTEND_URL,
})

module.exports = config;