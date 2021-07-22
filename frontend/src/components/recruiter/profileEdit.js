import React, {Component} from 'react';
import axios from 'axios';

export default class ProfileEdit extends Component{
    constructor(props){
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeContact = this.onChangeContact.bind(this);
        this.onChangeBio = this.onChangeBio.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            name: "",
            email: "",
            contact: "",
            bio: "",
            message: "",
            errorOccured: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.location = "/applicant/profile";
        axios.get("http://localhost:5000/recruiter/profile", {params: {user_id}})
        .then(res => {
            let {data} = res;
            if(data.message) this.setState({errorOccured: true, message: data.message});
            else{
                let {name, email, contact} = data.profile;
                let bio = data.profile.bio.join(" ");
                this.setState({name, email, contact, bio});
            }
        })
        .catch(err => this.setState({
            errorOccured: true,
            message: err.message
        }))
    }
    onChangeName(e){
        this.setState({name: e.target.value});
    }
    onChangeEmail(e){
        this.setState({email: e.target.value});
    }
    onChangeContact(e){
        this.setState({contact: e.target.value});
    }
    onChangeBio(e){
        this.setState({bio: e.target.value});
    }
    onSubmit(e){
        e.preventDefault();
        let {name, email, contact} = this.state;
        let bio = this.state.bio.split(" ");
        const updatedProfile = {
            name, email, contact, bio
        }
        let user_id = sessionStorage.getItem("user_id");
        axios.post("http://localhost:5000/recruiter/profile/edit", updatedProfile, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else{
                alert("Profile is updated");
                window.location = "/recruiter/profile";
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}))
    }
    render(){
        return(
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label><strong>Name:</strong></label>
                        <input type="text" value={this.state.name} 
                        className="form-control" onChange={this.onChangeName}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Email:</strong></label>
                        <input type="email" value={this.state.email} 
                        className="form-control" onChange={this.onChangeEmail}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Contact:</strong></label>
                        <input type="tel" pattern="[0-9]{10}" value={this.state.contact} 
                        className="form-control" onChange={this.onChangeContact}/>
                        <small>format:<strong>1234567890</strong></small>
                    </div>
                    <div className="form-group">
                        <label><strong>Bio:</strong></label>
                        <textarea className="form-control" rows="3" 
                        value={this.state.bio} onChange={this.onChangeBio}/>
                    </div>
                    <input type="submit" className="btn btn-outline-success" value="Save"/>
                </form>
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger": "alert-success"}>{this.state.message}</p>
            </div>
        );
    }
}