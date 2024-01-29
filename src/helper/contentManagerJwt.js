const jwt = require('jsonwebtoken');

module.exports.decodedToken = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ').pop();
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
            req.managerId = decodedToken.managerId;
            next()
        }
        else {
            throw res.json({ message: 'Token is require' })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error
        );
    }
}