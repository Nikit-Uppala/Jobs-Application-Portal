const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, unique: true},
    password: {type: String, required: true, trim: true, minLength:6 },
    activeApplications: {type: Number, deafult:0},
    education: [{
        instiname: {type: String, required: true, trim: true},
        startyear: {type: Number, required: true},
        endyear: {type: Number}
    }],
    skills: [{type: String, required:true, trim: true, uppercase: true}],
    numberRates: {type: Number, default: 0},
    rating: {type:Number, default:0},
    isAccepted: {type: Boolean, default: false}
});

module.exports = ApplicantModel = mongoose.model("applicant", applicantSchema);