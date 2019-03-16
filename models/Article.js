var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Create a new article Schema.
var ArticleSchema = new Schema({
  title: {
    type: String,
    require: false
  },
  link: {
    type: String,
    unique: true,
    require: false
  },
  saved: {
    type: Boolean,
    default: false
  },
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  ]
});

// Create model
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;