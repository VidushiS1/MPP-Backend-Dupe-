const mongoose = require('../helper/dbconnection');

const desciplineSchema = new mongoose.Schema({
    institute_id: {
        type: String,
        require: true,
    },
    discipline_name: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const Desciplines = mongoose.model('desciplines', desciplineSchema);

module.exports = Desciplines;