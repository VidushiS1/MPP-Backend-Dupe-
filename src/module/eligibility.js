const mongoose = require('../helper/dbconnection');

const eligibilitySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const Eligibility = mongoose.model('eligibility', eligibilitySchema);

module.exports = Eligibility;