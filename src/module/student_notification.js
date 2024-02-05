const mongoose = require('../helper/dbconnection');

const studentNotificationSchema = new mongoose.Schema({
    criteria: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    userId: {
        type: String,
        require: true,
    }
}, { timestamps: true });

const StudentNotifications = mongoose.model('student_notification', studentNotificationSchema);

module.exports = StudentNotifications;