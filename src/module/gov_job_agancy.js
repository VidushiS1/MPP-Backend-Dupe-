const mongoose = require('../helper/dbconnection');

const govJobAgancySchema = new mongoose.Schema({
    job_agency: {
        type: String,
        require: true,
    },
    // type: {
    //     type: String,
    //     require: true,
    // },
}, { timestamps: true });

const GovJobAgancy = mongoose.model('gov_job_agancy', govJobAgancySchema);

module.exports = GovJobAgancy;