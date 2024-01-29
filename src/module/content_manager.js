const mongoose = require('../helper/dbconnection');

const contentManagerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        default : null
    },
    email: {
        type: String,
        require: true,
        default : null
    },
    mobile_no: {
        type: String,
        require: true,
        default : null
    },
    fcm_token: {
        type: String,
        require: true,
        default : null
    },
    password: {
        type: String,
        require: true,
        default : null
    },
    profile: {
        type: String,
        require: false,
        default: null
    },
}, { timestamps: true });

const ContentManager = mongoose.model('content_manager', contentManagerSchema);

module.exports = ContentManager;