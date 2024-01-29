const mongoose = require('../helper/dbconnection');

const studentSchema = new mongoose.Schema({
    userId :{
        type: String,
        require: true,
    },
    student_name: {
        type: String,
        require: true,
    },
    dob: {
        type: String,
        require: true,
    },
    gender: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    father_name: {
        type: String,
        require: true,
    },
    father_occupation: {
        type: String,
        require: true,
    },
    mother_name: {
        type: String,
        require: true,
    },
    mother_occupation: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    designation: {
        type: String,
        require: true,
    },
    posting_unit: {
        type: String,
        require: true,
    },
    relation: {
        type: String,
        require: true,
    },
    hobbys: {
        type: [String],
        require: null,
    },
}, { timestamps: true });

const Students = mongoose.model('students', studentSchema);

module.exports = Students;