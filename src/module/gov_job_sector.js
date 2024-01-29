const mongoose = require('../helper/dbconnection');

const govJobSectorSchema = new mongoose.Schema({
    job_sector: {
        type: String,
        require: true,
    },
    // type: {
    //     type: String,
    //     require: true,
    // },
}, { timestamps: true });

const GovJobSector = mongoose.model('gov_job_sector', govJobSectorSchema);

module.exports = GovJobSector;