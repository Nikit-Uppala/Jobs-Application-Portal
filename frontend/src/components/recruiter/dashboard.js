import React, {Component} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';


export default class Dashboard extends Component{
    constructor(props){
        super(props);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.state = {
            jobs: [],
            errorOccured: false,
            message: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.location = "/applicant/dashboard";
        axios.get("http://localhost:5000/recruiter/dashboard", {params: {user_id}})
        .then(res => {
            let {message, jobs} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else{
                if(jobs.length===0) this.setState({errorOccured: true, message: "No active job listings found"});
                else this.setState({errorOccured: false, message: "", jobs});
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    onClickDelete(job_id){
        let user_id = sessionStorage.getItem("user_id");
        let confirmation = window.confirm("Changes can't be undone. Are you sure you want to delete it?");
        if(!confirmation) return;
        axios.delete(`http://localhost:5000/recruiter/dashboard/delete/${job_id}`, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({errorOccured: true, message: message});
            else window.location = "/recruiter/dashboard";
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}))
    }
    render(){
        return(
            <div>
                <br/>
                <Link to="/recruiter/dashboard/create" className="btn btn-outline-success">Create A Job Listing</Link>
                <br/><br/>
                {[...this.state.jobs].map(element => {
                    let deadline = new Date(element.deadline);
                    let date = deadline.toLocaleDateString();
                    let time = deadline.toLocaleTimeString();
                    return(
                        <div>
                            <div className="card">
                            <Link to={
                                {
                                    pathname: `/recruiter/dashboard/applications/${element._id}/${element.title}`
                                }
                            } className="btn btn-light">
                                <div className="card-body">
                                    <h2 className="card-title">{element.title}</h2>
                                    <div>
                                        <label><strong>Date of posting:</strong></label>
                                        <span>{element.postdate.split("T")[0]}</span>
                                    </div>
                                    <div>
                                        <label><strong>Applications recieved:</strong></label>
                                        <span>{element.applicationsRecieved}</span>
                                    </div>
                                    <div>
                                        <label><strong>Maximum number of applications:</strong></label>
                                        <span>{element.maxapplications}</span>
                                    </div>
                                    <div>
                                        <label><strong>Positions Filled:</strong></label>
                                        <span>{element.positionsFilled}</span>
                                    </div>
                                    <div>
                                        <label><strong>Maximum number of positions:</strong></label>
                                        <span>{element.maxpositions}</span>
                                    </div>
                                    <div>
                                        <label><strong>Deadline:</strong></label>
                                        <span>{date}  {time}</span>
                                    </div>
                                    <div className="container row">
                                        <button type="button" onClick={() => this.onClickDelete(element._id)}
                                        className="btn btn-outline-danger col">Delete</button>
                                        <Link to={
                                            {   
                                                pathname: `/recruiter/dashboard/edit/${element._id}`,
                                            }
                                        }
                                        className="btn btn-outline-primary col">Edit</Link>
                                    </div>
                                </div>
                                </Link>
                            </div>
                            <br/>
                        </div>
                );
                })}
                <p className={this.state.errorOccured?"alert alert-danger": ""}>{this.state.message}</p>
            </div>
        );
    }
}