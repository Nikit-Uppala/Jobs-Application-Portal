import React, {Component} from 'react';
import axios from 'axios';

export default class JobApply extends Component{
    constructor(props){
        super(props);
        this.onChangeSOP = this.onChangeSOP.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            job_id: props.match.params.id,
            job_title: props.match.params.title,
            sop: "",
            errorOccured: false,
            message: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="recruiter") window.location = "/recruiter/dashboard";
        axios.get(`http://localhost:5000/applicant/isEligible/${this.state.job_id}`, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message){
                alert(message);
                window.location = "/applicant/dashboard";
            }
        })
        .catch(err => this.setState({message: err.message, errorOccured: true}));
    }
    onChangeSOP(e){
        this.setState({sop: e.target.value});
    }
    onSubmit(e){
        e.preventDefault();
        let user_id = sessionStorage.getItem("user_id");
        let {sop, job_id} = this.state;
        axios.post(`http://localhost:5000/applicant/dashboard/apply/${job_id}`, {sop: sop.trim().split(" ")}, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({errorOccured: true, message: message});
            else{
                alert("Job Application Sent");
                window.location = "/applicant/dashboard";
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    render(){
        return(
            <div>
                <br/>
                <h3>{this.state.job_title}</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-froup">
                        <label><strong>Statement of purpose:</strong></label>
                        <textarea className="form-control" value={this.state.sop} onChange={this.onChangeSOP}/>
                    </div>
                    <br/>
                    <input type="submit" className="btn btn-outline-success" value="Submit"/>
                </form>
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger":""}>{this.state.message}</p>
            </div>
        );
    }
}