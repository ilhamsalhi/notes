const mongoose = require('mongoose')
const URL = process.env.MONGOOSE_URI

mongoose.set('strictQuery',false)

mongoose.connect(URL)
.then((result) => {
    console.log("connected successfully to mongodb")
})
.catch((error) => {
    console.log('failed to connect to mongodb')
})

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    important: Boolean,
})

noteSchema.set('toJSON', {
    transform: (doc, rt) => {
        rt.id = rt._id.toString()
        delete rt._id
        delete rt.__v
    }
})

module.exports = mongoose.model('Note', noteSchema);