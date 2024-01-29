const mongoose = require('../helper/dbconnection');

const careerAgendaSchema = new mongoose.Schema({
    agenda: {
        type: String,
        require: true,
    },
    // type: {
    //     type: String,
    //     require: true,
    // },
}, { timestamps: true });

const careerAgenda = mongoose.model('career_agenda', careerAgendaSchema);

module.exports = careerAgenda;