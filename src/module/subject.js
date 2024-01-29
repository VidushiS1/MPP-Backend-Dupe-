const mongoose = require('../helper/dbconnection');

const subjectsSchema = new mongoose.Schema({
    institute_id: {
        type: String,
        require: true,
    },
    discipline_id: {
        type: String,
        require: true,
    },
    subject: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const Subjects = mongoose.model('subjects', subjectsSchema);

module.exports = Subjects;