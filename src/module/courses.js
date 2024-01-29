const mongoose = require('../helper/dbconnection');

const coursesSchema = new mongoose.Schema({
    institute_id: {
        type: String,
        require: true,
    },
    discipline_id: {
        type: String,
        require: true,
    },
    subject_name: {
        type: String,
        require: true,
    },
    course_name: {
        type: String,
        require: true,
    },
    program_lavel: {
        type: String,
        require: true,
    },
    place: {
        type: String,
        require: true,
    },
    institute_type: {
        type: String,
        require: true,
    },
    institute_url: {
        type: String,
        require: true,
    },
    course_url: {
        type: String,
        require: true,
    }
}, { timestamps: true });

const Courses = mongoose.model('courses', coursesSchema);

module.exports = Courses;