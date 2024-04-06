const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    passwordHash: String,
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (doc, rt) => {
        rt.id = rt._id.toString()
        delete rt._id
        delete rt.__v
        delete rt.passwordHash // the password should not be revealed
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User