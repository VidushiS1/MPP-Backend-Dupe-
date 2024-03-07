const mongoose = require('../helper/dbconnection');

const notificationSchema = new mongoose.Schema({
    criteria: {
        type: Array,
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
}, { timestamps: true });

const Notifications = mongoose.model('notifications', notificationSchema);

module.exports = Notifications;