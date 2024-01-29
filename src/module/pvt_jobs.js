const mongoose = require('../helper/dbconnection');

const pvtJobSchema = new mongoose.Schema({
    sector_id: {
        type: String,
        require: true,
    },
    job_title: {
        type: String,
        require: true,
    },
    eligibility_qualification: {
        type: String,
        require: true,
    },
    company: {
        type: String,
        require: true,
    },
    salary: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    website: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const PvtJobS = mongoose.model('pvt_jobs', pvtJobSchema);

module.exports = PvtJobS;