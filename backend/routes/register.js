const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const applicantModel = require('../models/applicant');
const recruiterModel=  require('../models/recruiter');


router.post("/applicant", function(req, res){
    const {name, email, password, education, skills} = req.body;
    if(!name || !password || !education || !skills || !email) return res.json({message: "Please enter all fields"});
    if(education.length==0 || skills.length==0) return res.json({message: "Please enter all fields"});
    const newApplicant = new applicantModel({
        name, email, password, education, skills
    });
    applicantModel.findOne({email: email})
    .then(appl => {
        if(appl) return res.json({message: "User already exists"});
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newApplicant.password, salt, function(err, hashed){
                if(err) return res.json({message: err.message});
                newApplicant.password = hashed;
                newApplicant.activeApplications = 0;
                newApplicant.isAccepted = false;
                newApplicant.save()
                .then(object => res.json({user_id: object.id}))
                .catch(err => res.json({message: err.message}));
            });
        })
    });
});

router.post("/recruiter", function(req, res){
    const {name, email, password, contact, bio} = req.body;
    if(!name || !email || !password || !contact || !bio) return res.json({message: "Please fill all the fields"});
    if(bio.length==0) return res.json({message: "Please enter all the fields"});
    if(bio.length>250) return res.json({message: "Too many words entered in bio"});
    recruiterModel.findOne({email: email})
    .then(result => {
        if(result) return res.json({message: "User already exists"});
        const newRecruiter = new recruiterModel({
            name, email, password, contact, bio
        });
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newRecruiter.password, salt, function(err, hashed){
                if(err) return res.json({message: err.message});
                newRecruiter.password = hashed;
                newRecruiter.save()
                .then(object => {
                    res.json({user_id: object.id});
                })
                .catch(err => {res.json({message: err.message})});
            });
        });
    })
    .catch(err=> res.json({message: err.message}));
});


module.exports = router;