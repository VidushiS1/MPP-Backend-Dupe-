const mongoose = require('../helper/dbconnection');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    employee_id: {
        type: String,
        require: true,
    },
    mobile_no: {
        type: String,
        require: true,
    },
    fcm_token: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        require: false,
        default: null
    },
    language: {
        type: String,
        require: false,
        default: null
    },
    profile: {
        type: String,
        require: false,
        default: null
    },
    otp: {
        type: String,
        require: false,
        default: null
    },
}, { timestamps: true });

const User = mongoose.model('users', UserSchema);

module.exports = User;