const mongoose = require('../helper/dbconnection');

const instituteSchema = new mongoose.Schema({
    institute_name: {
        type: String,
        require: true,
    },
    place: {
        type: String,
        default: null
    },
    institute_type: {
        type: String,
        default: null
    },
    institute_url: {
        type: String,
        default: null
    }
}, { timestamps: true });

const Institutes = mongoose.model('institutes', instituteSchema);

module.exports = Institutes;