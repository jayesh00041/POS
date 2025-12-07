const Invoice = require("../models/invoiceModel");
const createHttpError = require("http-errors");

const CounterToken = require("../models/counterTokenModel");
const dayjs = require("dayjs");

const createInvoice = async (req, res, next) => {
    try {
        const { customerName, mobileNumber, paymentMode, referenceNumber, items, totalPrice } = req.body;
        let calculatedTotal = 0;
        const counterWiseData = new Map();

        // Extract user ID from accessToken cookie
        const invoiceCreatorId = req.user._id; 

        // Validate and process cart items
        const itemMap = new Map();
        for (const item of items) {
            const { product, selectedVariation, quantity } = item;
            const itemPrice = selectedVariation ? selectedVariation.price : parseFloat(product.price);

            if (isNaN(itemPrice)) {
                throw createHttpError(400, `Invalid price for product: ${product.name}`);
            }

            const totalItemPrice = itemPrice * quantity;
            calculatedTotal += totalItemPrice;

            // Group variations under the same product
            const productKey = product.id;
            if (!itemMap.has(productKey)) {
                itemMap.set(productKey, {
                    id: product.id,
                    productName: product.name,
                    totalQuantity: 0,
                    total: 0,
                    variations: []
                });
            }

            const productEntry = itemMap.get(productKey);
            productEntry.totalQuantity += quantity;
            productEntry.total += totalItemPrice;
            productEntry.variations.push({
                name: selectedVariation ? selectedVariation.name : "Default",
                quantity,
                price: itemPrice,
                total: totalItemPrice
            });

            // Organize data counter-wise, grouping by product ID
            const counterNo = product.counterNo;
            if (!counterWiseData.has(counterNo)) {
                counterWiseData.set(counterNo, { counterNo, items: new Map(), counterTokenNumber: 0 });
            }

            const counterData = counterWiseData.get(counterNo);

            if (!counterData.items.has(productKey)) {
                counterData.items.set(productKey, {
                    product: product.id,
                    productName: product.name,
                    totalQuantity: 0,
                    variations: []
                });
            }

            const counterProduct = counterData.items.get(productKey);
            counterProduct.totalQuantity += quantity;
            counterProduct.variations.push({
                name: selectedVariation ? selectedVariation.name : "Default",
                quantity,
                price: itemPrice,
                total: totalItemPrice
            });
        }

        // Validate total price
        if (calculatedTotal !== totalPrice) {
            throw createHttpError(400, `Mismatch in total price. Expected: ${calculatedTotal}, Received: ${totalPrice}`);
        }

        // Get or create counter tokens for the day
        const today = dayjs().format("YYYY-MM-DD");
        const counterTokenMap = new Map();

        for (const counterNo of counterWiseData.keys()) {
            let counterToken = await CounterToken.findOne({ date: today, counterNo });
            if (!counterToken) {
                counterToken = await CounterToken.create({ date: today, counterNo, tokenNumber: 1 });
            } else {
                counterToken.tokenNumber += 1;
                await counterToken.save();
            }
            counterTokenMap.set(counterNo, counterToken.tokenNumber);
        }

        // Generate invoice number
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        const lastInvoiceNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('INV')[1]) + 1 : 1;
        const invoiceNumber = `INV${String(lastInvoiceNumber).padStart(5, '0')}`;

        // Assign token numbers to counters
        for (const [counterNo, data] of counterWiseData) {
            data.counterTokenNumber = counterTokenMap.get(counterNo);
            data.items = Array.from(data.items.values()); // Convert Map to array
        }

        // Create invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            customerName,
            mobileNumber,
            paymentMode,
            referenceNumber,
            cartItems: Array.from(itemMap.values()),
            totalAmount: calculatedTotal,
            counterWiseData: Array.from(counterWiseData.values()), // ✅ Fix applied here
            createdBy: invoiceCreatorId
        });        

        const dbInvoice = await Invoice.findById(invoice._id)
            .populate('createdBy', 'name')

        res.status(200).json({
            status: "success",
            invoice: dbInvoice,
        });
    } catch (error) {
        next(error);
    }
};


const getSalesTableData = async (req, res, next) => {
    try {
        // Get date range params
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        // Build filter object
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: startDate,
                    $lte: new Date(endDate.setHours(23, 59, 59))
                }
            };
        }

        // Add user filter based on role
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin'; // Assuming role is stored in user object
        
        // If not admin, only show user's own invoices
        if (!isAdmin) {
            dateFilter.createdBy = userId;
        }

        // Get all filtered results
        const invoices = await Invoice.find(dateFilter)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            status: "success", 
            data: invoices
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching sales data"));
    }
};

module.exports = { createInvoice, getSalesTableData };
