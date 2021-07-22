import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export default class NavBar extends Component{
    onClickLogout(){
        sessionStorage.removeItem("user_id");
        sessionStorage.removeItem("type");
        window.location = "/login";
    }
    render(){
        return(
            <div className="container">
                <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#recNavBar">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="recNavBar">
                        <span className="navbar-brand">JobsPortalApp</span>
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link to="/recruiter/dashboard" className="nav-link">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/recruiter/profile" className="nav-link">Profile</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/recruiter/employees" className="nav-link">My Employees</Link>
                            </li>
                            <li className="nav-item">
                                <span onClick={this.onClickLogout} className="nav-link">Logout</span>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}
