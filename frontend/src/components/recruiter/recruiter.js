import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import NavBar from "./navbar";
import Profile from "./profile";
import ProfileEdit from "./profileEdit";
import Dashboard from "./dashboard";
import JobCreate from "./jobCreate";
import JobEdit from "./jobEdit";
import JobApplications from "./jobApplications";
import MyEmployees from "./employee";

export default class Recruiter extends Component{
    render(){
        return(
            <Router>
                <NavBar/>
                <div className="container">
                    <Route path="/recruiter/profile" exact component={Profile}/>
                    <Route path="/recruiter/profile/edit" exact component={ProfileEdit} />
                    <Route path="/recruiter/dashboard" exact component={Dashboard}/>
                    <Route path="/recruiter/dashboard/create" exact component={JobCreate}/>
                    <Route path="/recruiter/dashboard/edit/:id" exact component={JobEdit}/>
                    <Route path="/recruiter/employees" exact component={MyEmployees} />
                    <Route path="/recruiter/dashboard/applications/:id/:title" exact component={JobApplications}/>
                </div>
            </Router>
        );
    }
}