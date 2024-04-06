const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true,
  },
  important: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});


noteSchema.set("toJSON", {
  transform: (doc, rt) => {
    rt.id = rt._id.toString();
    delete rt._id;
    delete rt.__v;
  },
});



module.exports = mongoose.model("Note", noteSchema)

