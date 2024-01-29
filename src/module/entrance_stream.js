const mongoose = require('../helper/dbconnection');

const entrance_streamSchema = new mongoose.Schema({
    steam_name: {
        type: String,
        require: true,
    },
    // type: {
    //     type: String,
    //     require: true,
    // },
}, { timestamps: true });

const Entrance_stream = mongoose.model('entrance_stream', entrance_streamSchema);

module.exports = Entrance_stream;