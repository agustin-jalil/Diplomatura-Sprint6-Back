const mongoose = require('mongoose');

const SuperheroSchema = new mongoose.Schema({
    name: String,
    power: String,
    image: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

module.exports = mongoose.model('Superhero', SuperheroSchema);
