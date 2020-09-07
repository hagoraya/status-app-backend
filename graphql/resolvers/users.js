const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

require('dotenv').config();
const User = require('../../models/User')
const { validateRegisterInput, validateLoginInput } = require('../../util/validators')


function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, process.env.SECRET_KEY, { expiresIn: '1h' });
}


module.exports = {
    Mutation: {
        async register(_, { registerInput: { username, email, password, confirmPassword } }) {
            // Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)
            if (!valid) {
                throw new UserInputError('Errors', { errors })
            }
            //TODO: Make sure user does not already exist
            const user = await User.findOne({ username });
            if (user) {
                throw new UserInputError('User already exists', {
                    errors: {
                        username: 'This username is already taken'
                    }
                })
            }

            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },

        async login(_, { username, password }) {
            const { errors, valid } = validateLoginInput(username, password);
            const user = await User.findOne({ username });

            if (!valid) {
                throw new UserInputError('Erros', { errors })

            }

            if (!user) {
                errors.general = "User not found"
                throw new UserInputError('User not found', { errors })
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = "Username or password does not match"
                throw new UserInputError('Username or password does not match', { errors })
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }

        }
    }
}