const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
  content: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });


const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: String,
  instructions: String,
  image: {
    url: { type: String, required: false },
    cloudinary_id: { type: String, required: false }
  },
 author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
