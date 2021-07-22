import React, {Component} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css";

const ProfileDisplay = function(props){
    return(
        <div className="card-body">
            <h1 className="card-title">My Profile</h1>
            <div>
                <label>Name:</label>
                <span>{props.name}</span>
            </div>
            <div>
                <label>E-mail:</label>
                <span>{props.email}</span>
            </div>
            <div>
                <label>Rating:</label>
                <span>{props.rating}</span>
            </div>
            <div>
                <label>Skills:</label>
                <ul>
                    {[...props.skills].map(skill => <li>{skill}</li>)}
                </ul>
            </div>
            <div>
                <label>Education:</label>
                <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">Institute Name</th>
                            <th scope="col">Start Year</th>
                            <th scope="col">End Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...props.education].map(row => {
                            return(<tr>
                                <td>{row.instiname}</td>
                                <td>{row.startyear}</td>
                                <td>{row.endyear?row.endyear:"-"}</td>
                            </tr>)
                        })}
                    </tbody>
                </table>
            </div>
            <Link to="/applicant/profile/edit" className="btn btn-outline-primary">Edit</Link>
        </div>
    );
}


export default class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
            name: "",
            email: "",
            skills: [],
            education: [],
            languages: [],
            rating: 0,
            errorOccured: false,
            message: ""
        }
    }

    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="recruiter") window.location = "/recruiter/profile";
        axios.get("http://localhost:5000/applicant/profile", {params: {user_id: user_id}})
        .then(res => {
            let {name, email, skills, education, rating} = res.data.user;
            if(res.data.message) this.setState({errorOccured: true, message: res.data.message});
            else this.setState({name, email, skills, education, rating, errorOccured: false, message: ""});
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    };
    render(){
        return(
            <div>
                <br/>
                <div className="card">
                    <ProfileDisplay name={this.state.name} email={this.state.email} 
                    skills={this.state.skills} education={this.state.education} rating={this.state.rating}/>
                </div>
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger":""}>{this.state.message}</p>
            </div>
        );
    }
}