const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema({
    recid: {type: String, required: true, trim: true, ref: "recruit"},
    empid: {type: String, required: true, trim: true, ref: "applicant"},
    jobid: {type: String, required: true, trim: true},
    joindate: {type: Date, required: true, default: Date.now},
    rating: {type: Number, default: 0}
});

module.exports = Employee = mongoose.model("employee", employeeSchema);