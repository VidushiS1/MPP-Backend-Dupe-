const mongoose = require('../helper/dbconnection');

const educationSchema = new mongoose.Schema({
    student_id: {
        type: String,
        require: true,
    },
    below_8th_class_name: {
        type: String,
        default: null,
    },
    below_8th_school_name: {
        type: String,
        default: null,
    },
    below_8th_education_medium: {
        type: String,
        default: null,
    },
    below_8th_passing_year: {
        type: String,
        default: null,
    },
    below_8th_education_mode: {
        type: String,
        default: null,
    },
    below_8th_parcentage: {
        type: String,
        default: null,
    },
    achivement8th: {
        type: String,
        default: null,
    },
    class_name: {
        type: String,
        default: null,
    },
    school_name: {
        type: String,
        default: null,
    },
    education_medium: {
        type: String,
        default: null,
    },
    passing_year: {
        type: String,
        default: null,
    },
    parcentage: {
        type: String,
        default: null,
    },
    education_mode: {
        type: String,
        default: null,
    },
    achivement: {
        type: String,
        default: null,
    },
    school_name_10th: {
        type: String,
        default: null,
    },
    board_10th: {
        type: String,
        default: null,
    },
    education_medium_10th: {
        type: String,
        default: null,
    },
    passing_year_10th: {
        type: String,
        default: null,
    },
    parcentage_10th: {
        type: String,
        default: null,
    },
    pursuing_10th: {
        type: String,
        default: null,
    },
    education_mode_10th: {
        type: String,
        default: null,
    },
    achivement_10th: {
        type: String,
        default: null,
    },
    school_name_12th: {
        type: String,
        default: null,
    },
    board_12th: {
        type: String,
        default: null,
    },
    education_medium_12th: {
        type: String,
        default: null,
    },
    passing_year_12th: {
        type: String,
        default: null,
    },
    parcentage_12th: {
        type: String,
        default: null,
    },
    pursuing_12th: {
        type: String,
        default: null,
    },
    education_mode_12th: {
        type: String,
        default: null,
    },
    achivement_12th: {
        type: String,
        default: null,
    },
    institute_ug_dp: {
        type: String,
        default: null,
    },
    course_ug_dp: {
        type: String,
        default: null,
    },
    education_medium_ug_dp: {
        type: String,
        default: null,
    },
    passing_year_ug_dp: {
        type: String,
        default: null,
    },
    parcentage_ug_dp: {
        type: String,
        default: null,
    },
    pursuing_ug_dp: {
        type: String,
        default: null,
    },
    education_mode_ug_dp: {
        type: String,
        default: null,
    },
    achivement_ug_dp: {
        type: String,
        default: null,
    },
    institute_ug: {
        type: String,
        default: null,
    },
    course_ug: {
        type: String,
        default: null,
    },
    education_medium_ug: {
        type: String,
        default: null,
    },
    passing_year_ug: {
        type: String,
        default: null,
    },
    parcentage_ug: {
        type: String,
        default: null,
    },
    pursuing_ug: {
        type: String,
        default: null,
    },
    education_mode_ug: {
        type: String,
        default: null,
    },
    achivement_ug: {
        type: String,
        default: null,
    },
    institute_pg: {
        type: String,
        default: null,
    },
    course_pg: {
        type: String,
        default: null,
    },
    education_medium_pg: {
        type: String,
        default: null,
    },
    passing_year_pg: {
        type: String,
        default: null,
    },
    parcentage_pg: {
        type: String,
        default: null,
    },
    pursuing_pg: {
        type: String,
        default: null,
    },
    education_mode_pg: {
        type: String,
        default: null,
    },
    achivement_pg: {
        type: String,
        default: null,
    },
}, { timestamps: true });

const Education = mongoose.model('qualification', educationSchema);

module.exports = Education;