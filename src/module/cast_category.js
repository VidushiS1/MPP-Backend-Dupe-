const mongoose = require('../helper/dbconnection');

const catsCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const CatsCategory = mongoose.model('cast_category', catsCategorySchema);

module.exports = CatsCategory;