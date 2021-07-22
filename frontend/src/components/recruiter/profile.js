import React, {Component} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

const ProfileDisplay = function(props){
    return(
        <div className="card-body">
            <h1 className="card-title">My Profile</h1>
            <div>
                <label><strong>Name:</strong></label>
                <span>{props.name}</span>
            </div>
            <div>
                <label><strong>Email:</strong></label>
                <span>{props.email}</span>
            </div>
            <div>
                <label><strong>Contact:</strong></label>
                <span>{props.contact}</span>
            </div>
            <div>
                <label><strong>Bio:</strong></label>
                <span>{props.bio.join(" ")}</span>
            </div>
            <Link to="/recruiter/profile/edit" className="btn btn-outline-primary">Edit</Link>
        </div>
    );
}

export default class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
            name: "",
            email: "",
            contact: "",
            bio: [],
            message: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.location = "/applicant/profile";
        axios.get("http://localhost:5000/recruiter/profile", {params: {user_id}})
        .then(res => {
            let {profile, message} = res.data;
            if(message) this.setState({message});
            else{
                let {name, email, contact, bio} = profile;
                this.setState({name, email, contact, bio});
            } 
        })
    }
    render(){
        return(
            <div>
                <div className="card">
                    <ProfileDisplay name={this.state.name} email={this.state.email} contact={this.state.contact} bio={this.state.bio}/>
                </div>
            </div>
        )
    }
}