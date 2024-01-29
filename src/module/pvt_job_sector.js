const mongoose = require('../helper/dbconnection');

const pvtSectorSchema = new mongoose.Schema({
    job_sector: {
        type: String,
        require: true,
    },
    // type: {
    //     type: String,
    //     require: true,
    // },
}, { timestamps: true });

const PvtJobSector = mongoose.model('pvt_job_sector', pvtSectorSchema);

module.exports = PvtJobSector;