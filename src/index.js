const express = require('express');
const app = express();
const userRoutes = require('../src/routes/userRoutes');
const myRoutes = require('../src/routes/myRoutes');
const contentManagerRoutes = require('./routes/contentManagerRoutes');

app.use('/user', userRoutes);
app.use('/myApi', myRoutes);
app.use('/content-manager', contentManagerRoutes);


module.exports = app;