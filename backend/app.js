// Import required modules
const express = require("express");
const path = require("path"); // Core Node.js module for handling file paths
const cookieParser = require("cookie-parser");
const createHttpError = require("http-errors");
const cors = require("cors");

// Import configurations and utilities
const connectDb = require("./config/database");
const config = require("./config/config");
const globalErrorHanddler = require("./middlewares/globalErrorHanddler");

// Initialize Express app
const app = express();

// Load environment variables
const PORT = config?.PORT || 8000;

// Connect to database
connectDb();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Serve static files (uploaded images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Default route to check server status
app.get("/", (req, res) => {
    res.json({ message: "Hello from Express.js" });
});

// Load API routes
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/invoice", require("./routes/invoiceRoute"));

// Global error handling middleware
app.use(globalErrorHanddler);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running`);
});
