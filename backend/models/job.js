const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title:{type: String, required:true, trim: true},
    recname:{type: String, required:true, trim: true, ref: 'recruiter'}, 
    recemail:{type: String, required:true, trim: true, ref: 'recruiter'},
    maxapplications: {type: Number, required:true, min: 1},
    maxpositions:{type: Number, required:true, max: this.maxapplications},
    postdate: {type: Date, required: true, default: Date.now},
    deadline: {type: Date, required: true, min: this.postDate},
    skillsets: [{type: String, required: true, trim: true}],
    jobType: {type: String, required: true, trim: true, lowercase: true, enum:["full-time", "part-time", "work from home", "wfh"]},
    duration: {type: Number, required: true, min: 0, max: 6},
    salarypermonth: {type: Number, required: true, min: 1},
    rating: {type: Number, default: 0},
    numberRates: {type: Number, default: 0},
    positionsFilled: {type: Number, default:0, max: this.maxpositions},
    applicationsRecieved: {type: Number, default:0, max: this.maxapplications},
    deleted: {type: Boolean, required: true, default: false}
});

module.exports = Job = mongoose.model("job", jobSchema);