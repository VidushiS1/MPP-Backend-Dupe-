const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // poolSize: 10,
    dbName: "Mpp_disha"
}).then((res) => {
    console.log('DB_Connected...')
}).catch((err) => {
    console.log('error', err)
});

module.exports = mongoose;
