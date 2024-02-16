const url = require('url');
const fs = require('fs');
const path = require('path');


module.exports.processImage = async (image, destinationFolder, req, folder) => {
    try {
        // console.log('req',req.protocol)
        const extention = image.name.split('.').pop();
        const todayDate = new Date();
        const newImage = todayDate.getTime() + Math.floor(100000 + Math.random() * 900000) + '.' + extention;
        const imageurl = `public/${destinationFolder}/${newImage}`;
        await image.mv(imageurl);
        const url = `${req.protocol}://${req.get('host')}/${destinationFolder}/${newImage}`;
        // console.log('url', url)
        return url;
    } catch (error) {
        console.log('error', error);
    }
}