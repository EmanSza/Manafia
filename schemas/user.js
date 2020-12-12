  
const { Schema, model } = require('mongoose');

const userSchema = Schema({
    _id: String,
});

module.exports = model('userSchema', userSchema);