var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Create a new note Schema
var NoteSchema = new Schema({
  body: {
    type: String,
    required: true,
    trim: true
  }
});

// Create model
var Note = mongoose.model("Note", NoteSchema);

// Export the model
module.exports = Note;