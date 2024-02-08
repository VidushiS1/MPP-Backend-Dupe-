const mongoose = require('../helper/dbconnection');

const ScholershipSchema = new mongoose.Schema({
    mp_police: {
        type: String,
        require: false,
    },
    level: {
        type: String,
        require: true,
    },
    cast_category_id: {
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
    scheme_closing_date: {
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

const Scholership = mongoose.model('scholership', ScholershipSchema);

module.exports = Scholership;