const mongoose = require('../helper/dbconnection');

const govJobSchema = new mongoose.Schema({
    sector_id: {
        type: String,
        require: true,
    },
    agency_id: {
        type: String,
        require: true,
    },
    job_title: {
        type: String,
        require: true,
    },
    eligibility_education: {
        type: String,
        require: true,
    },
    exam_for_selection: {
        type: String,
        require: true,
    },
    salary: {
        type: String,
        require: true,
    },
    exam_cunducting_agency: {
        type: String,
        require: true,
    },
    website: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const GovJobS = mongoose.model('gov_jobs', govJobSchema);

module.exports = GovJobS;