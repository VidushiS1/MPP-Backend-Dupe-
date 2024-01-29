const mongoose = require('../helper/dbconnection');

const scheduleMeetSchema = new mongoose.Schema({
    student_id: {
        type: String,
        require: true,
    },
    title: {
        type: [String],
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    schedule_date: {
        type: String,
        require: true,
    },
    schedule_from_time: {
        type: String,
        require: true,
    },
    // schedule_to_time: {
    //     type: String,
    //     require: true,
    // }
}, { timestamps: true });

const ScheduleMeets = mongoose.model('schedule_meets', scheduleMeetSchema);

module.exports = ScheduleMeets;