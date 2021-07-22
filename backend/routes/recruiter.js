const express = require('express');
const router = express.Router();
const jobModel = require('../models/job');
const recruiterModel = require('../models/recruiter');
const applicationModel = require('../models/application');
const applicantModel = require("../models/applicant");
const employeeModel = require("../models/employee");

router.get("/profile", function(req, res){
    let id = req.query.user_id;
    recruiterModel.findOne({_id: id})
    .then(row => {
        if(!row) return res.status(401).json({message: "Authentication failed"});
        return res.json({profile: row});
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/profile/edit", function(req, res){
    let user_id = req.query.user_id;
    recruiterModel.findOne({_id: user_id})
    .then(row => {
        if(!row) return res.status(401).json({message: "Authentication failed"});
        const {name, email, contact, bio} = req.body;
        recruiterModel.findOneAndUpdate({_id: user_id}, {name, email, contact, bio}, {new: true})
        .then(updatedRow => {
            if(!updatedRow) res.json({message: "Failed to update"});
            jobModel.updateMany({recemail: updatedRow.email}, {recname: updatedRow.name, recemail: updatedRow.email}, {new: true})
            .then(jobs => res.json({id: updatedRow.id}))
            .catch(err => res.json({message: err.message}));
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/dashboard", function(req, res){
    let id = req.query.user_id;
    recruiterModel.findOne({_id: id})
    .then(row => {
        if(!row) return res.json({message: "Authentication failed"});
        jobModel.find({recemail: row.email, deleted: false})
        .then(jobs => {
            if(jobs.length==0) return res.json({message: "No active job listings found"});
            res.json({jobs: jobs.filter(element => element.maxpositions>element.positionsFilled)});
        })
        .catch(err => res.json({message: err.message}))
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/dashboard/create", function(req, res){
    let id = req.query.user_id;
    recruiterModel.findOne({_id: id})
    .then(row => {
        if(!row) return res.json({message: "Authentication failed"});
        const { title, maxapplications, maxpositions, deadline, skillsets, jobType, duration, salarypermonth} = req.body;
        if(!skillsets || skillsets.length==0) return res.json({message: "Please enter all fields"});
        let dateDeadline = new Date(deadline), postingDate = new Date(Date.now());
        if(postingDate>dateDeadline) return res.json({message: "Invalid deadline"});
        const newJob = new jobModel({
            title, maxapplications, maxpositions, deadline: dateDeadline, skillsets, jobType, duration, salarypermonth,
            recname: row.name,
            recemail: row.email,
            deleted: false
        });
        newJob.save()
        .then(job => res.json({job: job}))
        .catch(err => res.json({message: err.message}))
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/dashboard/:jobid", function(req, res){
    let user_id = req.query.user_id;
    let job_id = req.params.jobid;
    recruiterModel.findOne({_id: user_id})
    .then(row => {
        if(!row) return res.json({message: "Authentication failed"});
        jobModel.findOne({_id: job_id})
        .then(job => {
            if(!job) return res.json({message: "No such job"});
            applicationModel.find({jobid: job_id, status: {$ne: "rejected"}})
            .sort({applicantid: 1})
            .then(applications => {
                let applicant_ids = [...applications].map(ele => ele.applicantid);
                applicantModel.find().where('_id').in(applicant_ids)
                .sort({_id: 1})
                .then(applicants => {
                    let result = [];
                    let len = applications.length;
                    for(let i=0; i<len; i++)
                        result.push({
                            application_id: applications[i].id,
                            name: applicants[i].name,
                            skills: applicants[i].skills,
                            date: applications[i].date,
                            education: applicants[i].education,
                            sop: applications[i].sop,
                            rating: applicants[i].rating,
                            stage: applications[i].status
                        })
                    return res.json({applications: result, disabled: job.maxpositions<job.positionsFilled});
                })
                .catch(err => res.json({message: err.message}));
            })
            .catch(err => res.json({message: err.message}));
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/updateStatus/:id", function(req, res){
    let user_id = req.query.user_id;
    let application_id = req.params.id;
    let status = req.body.status;
    if(!application_id) return res.json({message: "No job found"});
    recruiterModel.findOne({_id: user_id})
    .then(user => {
        if(!user) return res.json({message: "Authentication failed"});
        applicationModel.findOneAndUpdate({_id: application_id}, {status}, {new: true})
        .then(updated => {
            if(!updated) return res.json({message: "No application Found"});
            if(updated.status=="shortlisted") return res.json({success: "Success"});
            if(updated.status=="rejected"){
                applicantModel.findOneAndUpdate({_id: updated.applicantid}, {$inc:{activeApplications: -1}}, {new: true})
                .then(updated => res.json({activeApplications: updated.activeApplications}))
                .catch(err => res.json({message: err.message}));
            }
            else if(updated.status==="accepted"){
                applicantModel.findOneAndUpdate({_id: updated.applicantid},
                    {activeApplications: 0, isAccepted: true}, {new: true})
                .then(object => {
                    jobModel.findOneAndUpdate({_id: updated.jobid}, {$inc: {positionsFilled: 1}}, {new: true})
                    .then(job => {
                        const newEmployee = new employeeModel({
                            empid: object._id,
                            recid: user_id,
                            jobid: job._id,
                            rating: 0
                        });
                        newEmployee.save()
                        .then(employee => {
                            applicationModel.updateMany({applicantid: object._id, status: {$in: ["applied", "shortlisted"]}}, 
                                {status: "rejected"}, {new: true})
                            .then(applications => {
                                if(job.maxpositions==job.positionsFilled)
                                    applicationModel.updateMany({jobid: job._id, status: {$in: ["applied", "shortlisted"]}},
                                    {status: "rejected"}, {new: true})
                                    .then(apps => res.json({positionsFilled: job.positionsFilled}))
                                    .catch(err => res.json({message: err.message}));
                                else return res.json({positionsFilled: job.positionsFilled});
                            })
                            .catch(err => res.json({message: err.message}));
                        })
                        .catch(err => res.json({message: err.message}));
                    })
                    .catch(err => res.json({message: err.message}));
                })
                .catch(err => res.json({message: err.message}));
            }
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.delete("/dashboard/delete/:id", function(req, res){
    let user_id = req.query.user_id;
    let job_id = req.params.id;
    recruiterModel.findOne({_id: user_id})
    .then(rec =>{
        if(!rec) return res.json({message: "Authentication failed"});
        applicationModel.find({jobid: job_id}).where('status').equals('applied')
        .then(applications =>{
            [...applications].map(ele => ele.removeOne());
            jobModel.findOneAndUpdate({_id: job_id}, {deleted: true}, {new: true})
            .then(job => {
                res.json({deleted: job.deleted});
            })
            .catch(err => res.json({message: err.message}));
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/dashboard/edit/:id", function(req, res){
    let job_id = req.params.id;
    let user_id = req.query.user_id;
    recruiterModel.findOne({_id: user_id})
    .then(rec => {
        if(!rec) return res.json({message: "Authentication failed"});
        let {maxapplications, maxpositions, deadline} = req.body;
        if(!maxapplications || !maxpositions || !deadline) return res.json({message: "Can't leave the fields empty"});
        deadline = new Date(deadline);
        jobModel.findOneAndUpdate({_id: job_id}, {maxapplications, maxpositions, deadline}, {new: true})
        .then(updatedJob => res.json({job: updatedJob}))
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/editJob/:id", (req, res) => {
    let user_id = req.query.user_id;
    let job_id = req.params.id;
    recruiterModel.findOne({_id: user_id})
    .then(recruiter => {
        if(!recruiter) return res.json({message: "Authentication failed"});
        jobModel.findOne({_id: job_id})
        .then(job => {
            if(!job) return res.json({message: "No job found"});
            res.json({job});
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/employees", function(req, res){
    let user_id = req.query.user_id;
    recruiterModel.findOne({_id: user_id})
    .then(recruiter => {
        if(!recruiter) res.json({message: "Authentication failed"})
        employeeModel.find({recid: recruiter.id})
        .then(employees => {
            let emp_ids = [...employees].map(element => element.empid);
            applicantModel.find().where("_id").in(emp_ids)
            .then(applicants => {
                let job_ids = [...employees].map(element => element.jobid);
                jobModel.find().where('_id').in(job_ids)
                .then(jobs => {
                    let employeeList = [];
                    let len = employees.length;
                    let applLen = applicants.length;
                    let jobLen = jobs.length;
                    for(let i=0; i<len; i++){
                        let appIndex = 0, jobIndex = 0;
                        while(appIndex<applLen && employees[i].empid!=applicants[appIndex]._id) appIndex++;
                        while(jobIndex<jobLen && employees[i].jobid!=jobs[jobIndex]._id) jobIndex++;
                        let newEmployee = {
                            empid: employees[i]._id,
                            name: applicants[appIndex].name,
                            joinDate: employees[i].joindate,
                            jobType: jobs[jobIndex].jobType,
                            title: jobs[jobIndex].title,
                            empRating: applicants[appIndex].rating,
                            rating: employees[i].rating
                        }
                        employeeList.push(newEmployee);
                    }
                    res.json({employees: employeeList});
                })
                .catch(err => res.json({message: err.message}));
            })
            .catch(err => res.json({message: err.message}));
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/giveRating/:id", function(req, res){
    let user_id = req.query.user_id;
    let emp_id = req.params.id;
    let {rating} = req.body;
    if(!user_id) return res.json({message: "Authentication failed"});
    employeeModel.findOneAndUpdate({_id: emp_id}, {rating}, {new: true})
    .then(employee => {
        if(!employee) return res.json({message: "Failed to give rating"});
        applicantModel.findOne({_id: employee.empid})
        .then(applicant => {
            if(!applicant) return res.json({message: "Failed to give rating"});
            let newRating = (applicant.rating * applicant.numberRates + rating)/(applicant.numberRates + 1);
            applicantModel.findOneAndUpdate({_id: applicant._id}, {rating: newRating, numberRates: applicant.numberRates + 1}, 
                {new: true})
                .then(updated => res.json({rating: updated.rating}))
                .catch(err => res.json({message: err.message})); 
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

module.exports = router;