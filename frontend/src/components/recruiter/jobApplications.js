import React, {Component} from 'react';
import axios from 'axios';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddCircleIcon from "@material-ui/icons/AddCircle"
import CancelIcon from "@material-ui/icons/Cancel";
import { green, red, blue } from "@material-ui/core/colors";

export default class JobApplications extends Component{
    constructor(props){
        super(props);
        this.onChangeSort = this.onChangeSort.bind(this);
        this.checkStatus = this.checkStatus.bind(this);
        this.state = {
            job_id: props.match.params.id,
            job_title: props.match.params.title,
            applications: [],
            sortBy: "none",
            sort_options: ["none" ,"Name(asc)", "Name(desc)", "Date(asc)", "Date(desc)", "Rating(asc)", "Rating(desc)"],
            errorOccured: false,
            message: "",
            disabled: false
        }
    }
    updateStatus(application_id, status){
        let user_id = sessionStorage.getItem("user_id");
        if(status==="rejected" && !window.confirm("Are you sure you want to reject the application?")) return;
        axios.post(`http://localhost:5000/recruiter/updateStatus/${application_id}`, {status}, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({errorOccured: true, message: message});
            else{
                this.setState({errorOccured: false, message: ""});
                window.location.reload(true);
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}))
    }
    checkStatus(stage, application_id){
        let element;
        if(this.state.disabled) return(<span className="badge badge-danger">Max positions reached. Can't Accept anymore</span>)
        const acceptButton = <button className="btn" onClick={() => this.updateStatus(application_id, "accepted")}>
            <CheckCircleIcon style={{color: green[500], fontSize: 25}}/>
            </button>;
        const shortlistButton = <button className="btn" onClick={() => this.updateStatus(application_id, "shortlisted")}>
            <AddCircleIcon style={{color: blue[500], fontSize: 25}}/>
            </button>;
        const rejectButton = <button className="btn" onClick={() => this.updateStatus(application_id, "rejected")}>
            <CancelIcon style={{color: red[500], fontSize: 25}}/>
            </button>;
        if(stage==="applied")
            element =
                <div className="row">
                    {shortlistButton}
                    {rejectButton}
                </div>
        else if(stage==="shortlisted")
            element = 
                <div className="row">
                    {acceptButton}
                    {rejectButton}
                </div>
        else if(stage==="accepted")
            element = <div className="row"><p className="badge badge-success">Accepted</p></div>
        return element;
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.loaction = "/applicant/dashboard";
        axios.get(`http://localhost:5000/recruiter/dashboard/${this.state.job_id}`, {params: {user_id}})
        .then(res => {
            let {message, applications, disabled} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else{
                this.setState({errorOccured: false, message: "", applications, disabled});
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    onChangeSort(e){
        let option = e.target.value;
        let {applications, sort_options} = this.state;
        if(option.startsWith("Name")){
            if(option===sort_options[1]) applications.sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            else applications.sort((a,b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
        }
        else if(option.startsWith("Date")){
            if(option===sort_options[3]) applications.sort((a,b) => {
                let A = new Date(a.date), B = new Date(b.date);
                if(A<B) return -1;
                else if(A>B) return 1;
                else return 0;
            });
            else applications.sort((a,b) => {
                let A = new Date(a.date), B = new Date(b.date);
                if(A>B) return -1;
                else if(A<B) return 1;
                else return 0;
            });
        }
        if(option.startsWith("Rating")){
            if(option===sort_options[5]) applications.sort((a,b) => a.rating - b.rating);
            else applications.sort((a,b) => b.rating-a.rating);
        }
        this.setState({sortBy: option});
    }
    render(){
        return(
            <div>
                <br/>
                <h2>{this.state.job_title} Applications</h2>
                <br/>
                <div>
                    <label>Sort By:</label>
                    <select className="form-select" value={this.state.sortBy} onChange={this.onChangeSort}>
                        {[...this.state.sort_options].map(element => <option value={element}>{element}</option>)}
                    </select>
                </div>
                <div>
                <CheckCircleIcon style={{color: green[500], fontSize: 25}}/><label> - Accept</label>
                <br/>
                <AddCircleIcon style={{color: blue[500], fontSize: 25}}/><label> - Shortlist</label>
                <br/>
                <CancelIcon style={{color: red[500], fontSize: 25}}/><label> - Reject</label>
                </div>
                <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th>Name</th>
                            <th>Skills</th>
                            <th>Date of Application</th>
                            <th>Education</th>
                            <th>Statement of purpose</th>
                            <th>Rating</th>
                            <th>Current status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...this.state.applications].map(element => {
                            return(
                                <tr>
                                    <td>{element.name}</td>
                                    <td>{element.skills.join(",")}</td>
                                    <td>{element.date.split("T")[0]}<br/>{new Date(element.date).toLocaleTimeString()}</td>
                                    <td>
                                        <ul>
                                            {[...element.education].map(education => 
                                                <li>{education.instiname} 
                                                ({education.startyear} to {education.endyear?education.endyear:"-"})</li>
                                            )}
                                        </ul>
                                    </td>
                                    <td>{element.sop.join(" ")}</td>
                                    <td>{element.rating.toFixed(1)}</td>
                                    <td>{element.stage}</td>
                                    <td>
                                        {this.checkStatus(element.stage, element.application_id)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger":""}>{this.state.message}</p>
            </div>
        );
    }
}