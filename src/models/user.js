const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

// CREATES A SCHEMA THAT CAN BE MODIFIED BY MIDDLEWARE (EXAMPLE, HASH PASSWORDS)

const userSchema = new mongoose.Schema({ // CREATES A MODEL FOR EVERY USER TO STORE IN THE DATABASE (SIMILAR TO CLASSES IN PYTHON)
    name: {
        type: String,
        required: true, // MEANS NAME IS REQUIRED IN EVERY USER
        trim: true // DELETES SPACES IN THE STRING
    },
    email: {
        type: String,
        unique: true, // GUARANTESS UNIQUENESS (NO EMAIL REPEATED) -> I NEED TO WIPE THE DATABASE AND START IT FRESH WITH THE UNIQUE ELEMENT IN ORDER TO MAKE IT WORK
        required: true,
        trim: true,
        lowercase: true, // CONVERTS THE EMAIL TO LOWERCASE
        validate(value) {
            if (!validator.isEmail(value)) { // VALIDATES IF THE STRING IS AN EMAIL
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7, // SETS THE MINIMUN LENGTH REQUIRED FROM THE STRING INPUT
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0, // IF AGE NOT PROVIDED DEFAULT WILL BE 0
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: { // IS PROVIDED BY THE SERVER, NOT BY THE USER
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer // STORES THE BUFFER WITH THE BINARY IMG DATA IN THE DATABASE ATTACHED TO THE USER WHOSE IMG BELONGS TO
    }
}, { // WE PASS A SECOND OBJECT TO THE USER SCHEMA TO ENABLE TIMESTAMPS
    timestamps: true
})

userSchema.virtual('tasks', { // IT IS NOT STORED IN THE DATABASE, JUST LETS MONGOOSE KNOW THE RELATIONSHIP
    ref: 'Task',
    localField: '_id', // RELATIONSHIP BETWEEN THE OWNER ID AND THE TASK ID
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () { // USING toJSON SETS THIS FUNCTION BEHAVIOUR TO ALL TYPE OF REQUESTS (login, singup, read, etc), INSTEAD OF CREATING AN SPECIFIC METHOD FOR EACH
    const user = this
    const userObject = user.toObject() // CONVERTS THE USER TO AN OBJECT (mongoose)
    
    // REMOVE SPECIFIC DATA FROM THE OBJECT I SEND OFF WITH THE REQUEST MADE BY THE USER (BASICALLY REMOVE DATA TO PREVENT THE USER FROM SEEING THAT SENSIBLE DATA)
    delete userObject.password 
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token }) // ADDS THE TOKEN TO THE TOKENS ARRAY (WHICH IS REQUIRED ON THE userSchema)
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user 
}

// PRE -> DETERMINES THAT WILL BE EXECUTED, IN THIS CASE, BEFORE SAVING THE DATA TO THE DB 

userSchema.pre('save', async function (next) { // CANNOT BE AN ARROW FUNCTION BECAUSE IS GONNA PLAY A ROLE
    const user = this

    if (user.isModified('password')) { // WILL BE TRUE WHEN THE USER IS FIRST CREATED OR THE PASSWORD WAS UPDATED
        user.password = await bcrypt.hash(user.password, 8) // HASHES THE PASSWORD BEFORE SAVING IT
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('deleteOne', { document: true }, async function (next) { // document: true ENSURES THAT this IS REFERENCING A USER DOCUMENT
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

User.createIndexes() // THIS MAKES unique: true TO WORK

module.exports = User