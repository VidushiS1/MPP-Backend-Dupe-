const mongoose = require('../helper/dbconnection');

const sessionSchema = new mongoose.Schema({
    agenda: {
        type: String,
        require: true,
    },
    link: {
        type: String,
        require: true,
    }
}, { timestamps: true });

const Sessions = mongoose.model('sessions', sessionSchema);

module.exports = Sessions;