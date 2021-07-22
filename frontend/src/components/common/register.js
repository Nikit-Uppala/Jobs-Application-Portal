import React, {Component} from 'react';
import CommonNavBar from './commonNavBar';
import ApplicantRegister from "../applicant/register";
import RecruiterRegister from "../recruiter/register";

export default class Register extends Component{
    constructor(props){
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeType = this.onChangeType.bind(this);
        this.onSubmit = this.onSubmit.bind(this); 
        this.state = {
            name: "",
            email: "",
            password: "",
            type: "None",
            errorOccured: false,
            message: "",
            submittedBasic: false,
            element: <div></div>
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(user_id) window.location = `/${type}/dashboard`;
    }
    onChangeName(e){
        this.setState({name: e.target.value});
    }
    onChangeEmail(e){
        this.setState({email: e.target.value});
    }
    onChangePassword(e){
        this.setState({password: e.target.value});
    }
    onChangeType(e){
        this.setState({type: e.target.value});
    }

    onSubmit(e){
        e.preventDefault();
        let {name, email, password, type} = this.state;
        name = name.trim();
        email = email.trim();
        if(name.length===0 || email.length===0){
            this.setState({errorOccured: true, message: "Please fill all the fields"});
            return;
        }
        if(password.length<6){
            this.setState({errorOccured: true, message:"Password must contain atleast 6 letters"});
            return;
        }
        if(type==="None")
            this.setState({errorOccured: true, message: "Please mention if you are an applicant or a recruiter"});
        else{
            this.setState({errorOccured: false, submittedBasic: true, 
                message: "",
                element: type==="Applicant"?
                <ApplicantRegister name={name} email={email} password={password}/>:
                <RecruiterRegister name={name} email={email} password={password}/>
            });
        }
    }
    render(){
        return(
            <div>
                <CommonNavBar/>
                <div className="container">
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <label><strong>Name:</strong></label>
                            <input type="text" value={this.state.name} 
                            className="form-control" onChange={this.onChangeName} 
                            disabled={this.state.submittedBasic} />
                        </div>
                        <div className="form-group">
                            <label><strong>Email:</strong></label>
                            <input type="email" value={this.state.email} 
                            className="form-control" onChange={this.onChangeEmail} 
                            disabled={this.state.submittedBasic} />
                        </div>
                        <div className="form-group">
                            <label><strong>Password:</strong></label>
                            <input type="password" value={this.state.password} 
                            className="form-control" onChange={this.onChangePassword}
                            disabled={this.state.submittedBasic} />
                        </div>
                        <div className="form-group">
                            <label><strong>User Type:</strong></label>
                            <select className="form-select" value={this.state.type} onChange={this.onChangeType}
                            disabled={this.state.submittedBasic} readOnly={this.state.submittedBasic}>
                                <option value="None">None</option>
                                <option value="Applicant">Applicant</option>
                                <option value="Recruiter">Recruiter</option>
                            </select>
                        </div>
                        {!this.state.submittedBasic?<input type="submit" className="btn btn-outline-primary" value="Submit"/>:<br/>}
                        <br/>
                        <p className={this.state.errorOccured?"alert alert-danger":""}>{this.state.message}</p>
                    </form>
                    {this.state.element}
                </div>
            </div>
        );
    }
}