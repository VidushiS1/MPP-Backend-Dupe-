const mongoose = require('../helper/dbconnection');

const entranceExamSchema = new mongoose.Schema({
    stream_id: {
        type: String,
        require: true,
    },
    exam_name: {
        type: String,
        require: true,
    },
    brief_discription: {
        type: String,
        require: true,
    },
    progran_level: {
        type: String,
        require: true,
    },
    conducting: {
        type: String,
        require: true,
    },
    web_link: {
        type: String,
        require: true,
        
    },
}, { timestamps: true });

const Entrance_exam = mongoose.model('entrance_exam', entranceExamSchema);

module.exports = Entrance_exam;