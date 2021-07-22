const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const applicantModel = require('../models/applicant');
const recruiterModel=  require('../models/recruiter');

router.post("/login", function(req, res){
    const credentials = {
        email: req.body.email,
        password: req.body.password
    }
    if(!credentials.email || !credentials.password) return res.json({message: "Please Fill all the fields"});
    applicantModel.findOne({email: credentials.email})
    .then(user => {
        if(!user)
        {
            recruiterModel.findOne({email: credentials.email})
            .then(recruiter => {
                if(!recruiter) return res.json({message:"No user exists. Please register"});
                bcrypt.compare(credentials.password, recruiter.password, function(err, matched){
                    if(err) throw err;
                    if(!matched) return res.json({message:"Invalid Credentials"});
                    return res.json({user_id: recruiter.id, type: "recruiter"});
                });
            });
            return;
        }
        bcrypt.compare(credentials.password, user.password, function(err, matched){
            if(err) return res.json({message: "Sorry. An error has occured. Try logging in again"});
            if(!matched) return res.json({message:"Invalid Credentials"});
            return res.json({user_id: user.id, type: "applicant"});
        });
    })
});


module.exports = router;