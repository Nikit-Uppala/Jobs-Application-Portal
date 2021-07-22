import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export default class CommonNavBar extends Component{
    render(){
        return(
            <div className="container">
                <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#commonNavBar">
                        <span className="navbar-toggler-icon"></span>
                        </button>
                    <div className="collapse navbar-collapse" id="commonNavBar">
                    <span className="navbar-brand">JobsPortalApp</span>
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link to="/login" className="nav-link">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-link">Register</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}