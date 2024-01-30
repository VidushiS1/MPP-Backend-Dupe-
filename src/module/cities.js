const mongoose = require('../helper/dbconnection');

const CitySchema = new mongoose.Schema({
    id: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    }
});

const Cities = mongoose.model('cities', CitySchema);

module.exports = Cities;