const { AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')

require('dotenv').config();

module.exports = (context) => {
    //
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        //Bearer...
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            //verify token
            try {
                const user = jwt.verify(token, process.env.SECRET_KEY);
                return user;
            } catch (error) {
                throw new AuthenticationError('Invalid/Expired Token')
            }

        }
        throw new Error('Authentication token must be \'Bearer [Token]')
    }
    throw new Error('Authorization header must be provided')


}