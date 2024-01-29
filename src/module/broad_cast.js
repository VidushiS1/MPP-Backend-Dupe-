const mongoose = require('../helper/dbconnection');

const broutcatSchema = new mongoose.Schema({
    agenda: {
        type: String,
        require: true,
    },
    date: {
        type: String,
        require: true,
    },
    start_time: {
        type: String,
        require: true,
    },
    end_time: {
        type: String,
        require: true,
    },
    link: {
        type: String,
        require: true,
    }
}, { timestamps: true });

const Broudcast = mongoose.model('broud_cast', broutcatSchema);

module.exports = Broudcast;