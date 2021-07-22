const mongoose = require('mongoose');

const recruiterModel = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    contact: {type: String, required: true},
    bio: [{type: String, required: true}],
});


module.exports = RecruiterModel = mongoose.model("recruiter", recruiterModel);