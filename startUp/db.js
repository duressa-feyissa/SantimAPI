const mongoose = require('mongoose');
const url = 'mongodb+srv://bisry:wtmRJZboberj9rSB@cluster0.2scehsb.mongodb.net/?retryWrites=true&w=majority';
const options = { useNewUrlParser: true, useUnifiedTopology: true };

module.exports = function() {
  mongoose.connect(url, options)
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));
}