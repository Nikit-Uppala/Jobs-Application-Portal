import React, {Component} from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import NavBar from "./navbar";
import Profile from "./profile";
import ProfileEdit from "./profileEdit";
import Dashboard from "./dashboard";
import JobApply from "./jobApply";
import MyApplications from "./myApplications";

export default class Applicant extends Component {
    render(){
        return(
            <Router>
                <NavBar/>
                <div className="container">
                    <Route path="/applicant/profile" exact component={Profile}/>
                    <Route path="/applicant/profile/edit" exact component={ProfileEdit} />
                    <Route path="/applicant/dashboard" exact component={Dashboard}/>
                    <Route path="/applicant/dashboard/apply/:id/:title" exact component={JobApply} />
                    <Route path="/applicant/myapplications" exact component={MyApplications}/>
                </div>
            </Router>
        );
    }
}