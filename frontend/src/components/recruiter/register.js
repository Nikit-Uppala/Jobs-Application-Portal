import React, {Component} from 'react';
import axios from 'axios';

export default class RecruiterRegister extends Component{
    constructor(props){
        super(props);
        this.onChangeContact = this.onChangeContact.bind(this);
        this.onChangeBio = this.onChangeBio.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            name: props.name,
            email: props.email,
            password: props.password,
            contact: "",
            bio: "",
            errorOccured: false,
            message: ""
        }
    }
    onChangeContact(e){
        this.setState({contact: e.target.value});
    }
    onChangeBio(e){
        this.setState({bio: e.target.value});
    }
    onSubmit(e){
        e.preventDefault();
        let {name, email, password, contact, bio} = this.state;
        const newUser = {name, email, password, contact, bio};
        axios.post("http://localhost:5000/register/recruiter", newUser)
        .then(res => {
            let {message, user_id} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else{
                sessionStorage.setItem("user_id", user_id);
                sessionStorage.setItem("type", "recruiter");
                window.location = "/recruiter/dashboard";
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    render(){
        return(
            <div>
                <h2>Other details:</h2>
                <form onSubmit={this.onSubmit}>
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
                    <input type="submit" className="btn btn-outline-primary"/>
                    <br/>
                    <p className={this.state.errorOccured?"alert alert-danger": ""}>{this.state.message}</p>
                </form>
            </div>
        );
    }
}