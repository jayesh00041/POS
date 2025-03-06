const mongoose = require("mongoose");

const CounterTokenSchema = new mongoose.Schema({
    counterNo: { type: Number, required: true },
    tokenNumber: { type: Number, required: true },
    date: { type: String, required: true } // Store date as "YYYY-MM-DD" for reset logic
});

module.exports = mongoose.model("CounterToken", CounterTokenSchema);
