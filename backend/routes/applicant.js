const express = require('express');
const router = express.Router();
const applicantModel = require('../models/applicant');
const jobModel = require("../models/job");
const applicationModel = require("../models/application");
const employeeModel = require("../models/employee");

router.get("/dashboard", function(req, res){
    let user_id = req.query.user_id;
    applicantModel.findOne({_id: user_id})
    .then(applicant => {
        if(!applicant) return res.json({message: "Authentication failed"});
        jobModel.find({deleted: false}).where('deadline').gt(Date.now())
        .sort({title: 1})
        .then(jobs => {
            applicationModel.find({applicantid: applicant.id})
            .then(applications => {
                let result = [];
                let jobLength = jobs.length, applicationLength = applications.length;
                for(let i=0; i<jobLength; i++)
                {
                    let {id, title, recname, rating, salarypermonth, duration, 
                        deadline, jobType, maxapplications, applicationsRecieved, skillsets} = jobs[i];
                    let newObj = {
                        id, title, recname, rating, salarypermonth, duration, 
                        deadline, jobType, maxapplications, applicationsRecieved, skillsets
                    }
                    let index = -1;
                    for(let j=0; j<applicationLength; j++) if(jobs[i].id == applications[j].jobid) {index=j;break}
                    if(index==-1) newObj.status = "apply";
                    else newObj.status = applications[index].status;
                    result.push(newObj);
                }
                res.json({jobs: result, isAccepted: applicant.isAccepted});
            })
            .catch(err => res.json({message: err.message}))
        })
        .catch(err => res.json({message: err.message}))
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/dashboard/apply/:id", function(req, res){
    let user_id = req.query.user_id;
    let job_id = req.params.id;
    applicantModel.findOne({_id: user_id})
    .then(user => {
        if(!user) return res.json({message: "Authentication failed"});
        jobModel.findOne({_id: job_id})
        .then(job => {
            if(!job) return res.json({message: "No Job found"});
            let { sop } = req.body;
            sop = sop.filter(element => element.length>0);
            if(!sop || sop.length==0) return res.json({message: "Please fill the SOP"});
            if(sop.length>250) return res.json({message: "SOP too long"});
            const newApplication = new applicationModel({
                applicantid: user_id, jobid: job_id, sop
            });
            newApplication.save()
            .then(application => {
                applicantModel.findOneAndUpdate({_id: user_id}, {activeApplications: user.activeApplications + 1}, {new: true})
                .then(updated => {
                    jobModel.findOneAndUpdate({_id: job_id}, {applicationsRecieved: job.applicationsRecieved + 1})
                    .then(updatedJob => res.json({application_id: application._id}))
                    .catch(err => res.json({message: err.message}));
                })
                .catch(err => res.json({message: err.message}))
            })
            .catch(err => res.json({message: err.message}));
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/profile", function(req, res){
    const user_id = req.query.user_id;
    applicantModel.findOne({_id: user_id})
    .then(user => {
        if(!user) return res.json({message: "Authentication failed"});
        res.json({user});
    })
    .catch(err => res.json({message: err.message}));
});

router.post("/profile/edit", function(req, res){
    let user_id = req.query.user_id;
    applicantModel.findOne({_id: user_id})
    .then(user => {
        if(!user) return res.json({message: "Authentication failed"});
        const {name, email, education, skills} = req.body;
        if(!education || education.length==0 || !skills || skills.length==0)
            return res.json({message: "Can't leave fields empty"});
        applicantModel.findOneAndUpdate({_id: user_id}, {name, email, education, skills}, {new: true})
        .then(updatedUser => res.json({user: updatedUser.id}))
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/myapplications", function(req, res){
    let user_id = req.query.user_id;
    applicantModel.findOne({_id: user_id})
    .then(user => {
        if(!user) return res.json("Authentication failed");
        applicationModel.find({applicantid: user_id})
        .sort({jobid: 1})
        .then(applications => {
            let job_ids = [...applications].map(element => element.jobid);
            jobModel.find().where('_id').in(job_ids)
            .sort({_id: 1})
            .then(jobs => {
                employeeModel.find().where('jobid').in(job_ids)
                .sort({jobid: 1})
                .then(employees => {
                    let myApplications = [];
                    let len = jobs.length, empLen = employees.length;
                    for(let i=0; i<len; i++){
                        let index = -1, k=0;
                        while(k<empLen && employees[k].jobid != jobs[i]._id) k++;
                        if(k<empLen) index=k;
                        let Application = {
                            id: jobs[i]._id,
                            title: jobs[i].title,
                            salarypermonth: jobs[i].salarypermonth,
                            recname: jobs[i].recname,
                            joinDate: index!=-1?employees[k].joindate: "-",
                            canRate: applications[i].status=="accepted",
                            rating: applications[i].rating,
                            status: applications[i].status
                        }
                        myApplications.push(Application);
                    }
                    res.json({applications: myApplications});
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
    let job_id = req.params.id;
    let new_rating = req.body.rating;
    if(!user_id) return res.json({message: "Authentication failed"});
    applicationModel.findOneAndUpdate({applicantid: user_id, jobid: job_id}, {rating: new_rating}, {new: true})
    .then(updatedApplication => {
        jobModel.findOne({_id: job_id})
        .then(job => {
            let {rating, numberRates} = job;
            rating = (rating *  numberRates  + new_rating)/(numberRates+1);
            jobModel.findOneAndUpdate({_id: job_id}, {rating, numberRates: numberRates + 1}, {new: true})
            .then(updatedJob => res.json({jobRating: updatedJob.rating}))
            .catch(err => res.json({message: err.message}));
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

router.get("/isEligible/:id", function(req, res){
    let user_id = req.query.user_id;
    let job_id = req.params.id;
    applicantModel.findOne({_id: user_id})
    .then(applicant => {
        if(!applicant) return res.json({message: "Authentication Failed!"});
        if(applicant.activeApplications>=10) res.json({message: "Sorry! You can't apply to any more jobs. You have 10 active applications"});
        jobModel.findOne({_id: job_id})
        .then(job => {
            let deadline = new Date(job.deadline);
            let present = new Date(Date.now());
            if(deadline<present) return res.json({message: "Sorry! The deadline has expired."});
            res.json({apply: true});
        })
        .catch(err => res.json({message: err.message}));
    })
    .catch(err => res.json({message: err.message}));
});

module.exports = router;