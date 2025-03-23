const Invoice = require("../models/invoiceModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

/**
 * Get Sales & Billing Overview
 */
exports.getSalesOverview = async (req, res) => {
    try {
        const { userId, startDate, endDate, period } = req.query;
        const requestingUserId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        // Set up date filters
        let start, end;
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        } else {
            // Default to today if no dates provided
            const today = new Date();
            start = new Date(today.setHours(0, 0, 0, 0));
            end = new Date(today.setHours(23, 59, 59, 999));
        }

        // Build match criteria for invoices
        const matchCriteria = { 
            createdAt: { $gte: start, $lte: end } 
        };

        // Apply user filter based on role and requested userId
        if (!isAdmin) {
            // Non-admin users can only see their own data
            matchCriteria.createdBy = new mongoose.Types.ObjectId(requestingUserId);
        } else if (userId && userId !== 'all') {
            // Admin requesting specific user data
            matchCriteria.createdBy = new mongoose.Types.ObjectId(userId);
        }

        // Get sales data
        const totalSales = await Invoice.countDocuments(matchCriteria);
        
        // Get total revenue for the period regardless of grouping
        const totalRevenueResult = await Invoice.aggregate([
            { $match: matchCriteria },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        
        const totalRevenueAmount = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
        
        // Get revenue data with period grouping if specified
        let revenueAggregation;
        
        if (period === 'daily') {
            revenueAggregation = [
                { $match: matchCriteria },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        date: { $first: "$createdAt" },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    } 
                },
                { $sort: { date: 1 } }
            ];
        } else if (period === 'weekly') {
            revenueAggregation = [
                { $match: matchCriteria },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: "$createdAt" },
                            week: { $week: "$createdAt" }
                        },
                        firstDay: { $first: "$createdAt" },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    } 
                },
                { $sort: { firstDay: 1 } }
            ];
        } else if (period === 'monthly') {
            revenueAggregation = [
                { $match: matchCriteria },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        firstDay: { $first: "$createdAt" },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    } 
                },
                { $sort: { firstDay: 1 } }
            ];
        } else {
            // Default: just get the total
            revenueAggregation = [
                { $match: matchCriteria },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ];
        }

        const totalRevenue = await Invoice.aggregate(revenueAggregation);

        // Get users based on role
        let users = [];
        if (isAdmin) {
            users = await User.find({}, 'name email role');
        } else {
            users = await User.find({ _id: requestingUserId }, 'name email role');
        }

        // Format response based on period
        let response;
        if (['daily', 'weekly', 'monthly'].includes(period)) {
            // Transform the period data into the required format
            const formattedPeriodData = totalRevenue.map(item => {
                let text;
                if (period === 'daily') {
                    // Format: "YYYY-MM-DD"
                    text = item.date.toISOString().split('T')[0];
                } else if (period === 'weekly') {
                    // Format: "Week W (YYYY-MM-DD)" where the date is the first day of the week
                    const weekNum = item._id.week;
                    const startDate = item.firstDay.toISOString().split('T')[0];
                    text = `Week ${weekNum} (${startDate})`;
                } else if (period === 'monthly') {
                    // Format: "Month YYYY"
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"];
                    const monthName = monthNames[item._id.month - 1];
                    text = `${monthName} ${item._id.year}`;
                }
                
                return {
                    text: text,
                    value: item.total,
                    count: item.count
                };
            });
            
            response = {
                totalOrders: totalSales,
                totalRevenue: totalRevenueAmount,
                periodData: formattedPeriodData,
                users
            };
        } else {
            response = {
                totalOrders: totalSales,
                totalRevenue: totalRevenueAmount,
                users
            };
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getSalesOverview:", error);
        res.status(500).json({ message: "Error fetching sales data", error: error.message });
    }
};


/**
 * Get Product & Category Insights
 */
exports.getProductInsights = async (req, res) => {
    try {
        const topSellingProducts = await Invoice.aggregate([
            { $unwind: "$cartItems" },
            { $group: { _id: "$cartItems.product", name: { $first: "$cartItems.productName" }, totalSold: { $sum: "$cartItems.totalQuantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        const leastSellingProducts = await Invoice.aggregate([
            { $unwind: "$cartItems" },
            { $group: { _id: "$cartItems.product", name: { $first: "$cartItems.productName" }, totalSold: { $sum: "$cartItems.totalQuantity" } } },
            { $sort: { totalSold: 1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            topSellingProducts,
            leastSellingProducts
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product insights", error });
    }
};

/**
 * Get User & Employee Stats
 */
exports.getUserStats = async (req, res) => {
    try {
        const totalBillers = await User.countDocuments({ role: "biller" });
        const activeBillers = await Invoice.aggregate([
            { $group: { _id: "$createdBy", totalOrders: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { _id: "$user._id", name: "$user.name", totalOrders: 1 } },
            { $sort: { totalOrders: -1 } }
        ]);

        res.status(200).json({
            totalBillers,
            activeBillers
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user stats", error });
    }
};
