const mongoose = require('../helper/dbconnection');

const timeSlotSchema = new mongoose.Schema({
    slot: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const Time_slot = mongoose.model('time_slot', timeSlotSchema);

module.exports = Time_slot;