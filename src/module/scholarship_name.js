const mongoose = require('../helper/dbconnection');

const scholarshipNameSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    // type: {
    //     type: String,
    //     require: true,
    // },
}, { timestamps: true });

const ScholarshipName = mongoose.model('scholarship_name', scholarshipNameSchema);

module.exports = ScholarshipName;