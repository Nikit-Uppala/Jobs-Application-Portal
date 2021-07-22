const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
    jobid: {type: String, required: true, trim: true, ref: "job"},
    applicantid: {type: String, required: true, trim: true, ref: "applicant"},
    date: {type: Date, default: Date.now},
    sop: [{type: String, required: true, trim: true}],
    status: {type: String, default: "applied", trim: true, lowercase: true, enum: ["accepted", "rejected", "applied", "shortlisted"]},
    rating: {type: Number, required: true, default: 0, max: 5}
});

module.exports = Application = mongoose.model("application", applicationSchema);