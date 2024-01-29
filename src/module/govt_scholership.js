const mongoose = require('../helper/dbconnection');

const govtScholershipSchema = new mongoose.Schema({
    scholarship_id: {
        type: String,
        require: true,
    },
    scheme_name: {
        type: String,
        require: true,
    },
    amount_of_scholership: {
        type: String,
        require: true,
    },
    eligibility: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    slots: {
        type: String,
        require: true,
    },
    scheme_close_date: {
        type: String,
        require: true,
    },
    guidelines: {
        type: String,
        require: true,
    },
    faq: {
        type: String,
        require: true,
    },
    website: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const GovtScholership = mongoose.model('govt_scholership', govtScholershipSchema);

module.exports = GovtScholership;