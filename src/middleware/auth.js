const jwt = require('jsonwebtoken')
const User = require('../models/user')

// IN POSTMAN I CREATED A HEADER WITH A AUTHENTICATION KEY AND AS VALUE 'Bearer token' OVER THE READ USERS GET REQUEST
// TO MAKE IT TO WORK ALONG ALL TYPE OF REQUESTS YOU HAVE TO SET AUTH TYPE TO 'INHERIT AUTH FROM PARENT' AND EDIT THE POSTMAN COLLECTION TO USE AS DEFAULT A BEARER TOKEN TO AUTHENTICATE
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error() // THIS IS ENOUGH TO TRIGGER CATCH DOWN BELOW
        }

        req.token = token
        req.user = user
        next() // IF USER AUTHENTICATED CORRECTLY 
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth 