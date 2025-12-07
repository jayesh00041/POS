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

// CORS configuration - Corrected and Improved
app.use(cors({
    origin: ["http://localhost:3000", "https://jayesh00041.github.io"], // Allow frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"], // Allowed headers
    credentials: true, // Allow cookies if needed
}));

// Handle preflight requests
app.options("*", cors());

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
app.use("/api/dashboard", require("./routes/dashboardRoute"));
app.use("/api/payment-settings", require("./routes/paymentSettingsRoute"));

// Global error handling middleware
app.use(globalErrorHanddler);

// Start the server
app.listen(PORT, () => {
    // Server running
});