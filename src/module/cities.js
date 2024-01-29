const mongoose = require('../helper/dbconnection');

const CitySchema = new mongoose.Schema({
    id:{
        type : String,
        require : true
    },
    name:{
        type : String,
        require : true
    },
    state_id:{
        type : String,
        require : true
    }
});

const Cities = mongoose.model('cities',CitySchema);

module.exports = Cities;