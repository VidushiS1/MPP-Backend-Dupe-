const mongoose = require('../helper/dbconnection');

const castCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const CastCategory = mongoose.model('cast_category', castCategorySchema);

module.exports = CastCategory;