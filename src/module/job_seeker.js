const mongoose = require('../helper/dbconnection');

const jobSeekerSchema = new mongoose.Schema({
    student_id: {
        type: String,
        require: true,
    },
    job_role: {
        type: String,
        require: false,
    },
    // class_name: {
    //     type: String,
    //     require: false,
    // },
    // school_name: {
    //     type: String,
    //     require: false,
    // },
    // passing_year: {
    //     type: String,
    //     require: false,
    // },
    // parcentage: {
    //     type: String,
    //     require: false,
    // },
    school_name_10th: {
        type: String,
        require: false,
    },
    board_10th: {
        type: String,
        require: false,
    },
    passing_year_10th: {
        type: String,
        require: false,
    },
    parcentage_10th: {
        type: String,
        require: false,
    },
    school_name_12th: {
        type: String,
        require: false,
    },
    board_12th: {
        type: String,
        require: false,
    },
    subject_12th: {
        type: String,
        require: false,
    },
    passing_year_12th: {
        type: String,
        require: false,
    },
    parcentage_12th: {
        type: String,
        require: false,
    },
    institute_ug: {
        type: String,
        require: false,
    },
    course_ug: {
        type: String,
        require: false,
    },
    passing_year_ug: {
        type: String,
        require: false,
    },
    parcentage_ug: {
        type: String,
        require: false,
    },
    institute_pg: {
        type: String,
        require: false,
    },
    course_pg: {
        type: String,
        require: false,
    },
    passing_year_pg: {
        type: String,
        require: false,
    },
    parcentage_pg: {
        type: String,
        require: false,
    },
}, { timestamps: true });

const Jobseeker = mongoose.model('job_seekers', jobSeekerSchema);

module.exports = Jobseeker;