const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // CREATES A REFERENCE TO THE User MODEL CREATED WITH MONGOOSE (NOW I CAN FETCH EVERY FIELD FROM A USER)
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

Task.createIndexes()

module.exports = Task