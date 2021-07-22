import React, {Component} from 'react';
import axios from 'axios';

export default class JobEdit extends Component{
    constructor(props){
        super(props);
        let job_id = props.match.params.id;
        this.onChangeMaxApplications = this.onChangeMaxApplications.bind(this);
        this.onChangeMaxPositions = this.onChangeMaxPositions.bind(this);
        this.onChangeDeadlineDate = this.onChangeDeadlineDate.bind(this);
        this.onChangeDeadlineTime = this.onChangeDeadlineTime.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            job_id: job_id,
            job_title: "",
            maxapplications: "",
            maxpositions: "",
            deadline_date: "",
            deadline_time: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.location = "/applicant/dashboard";
        axios.get(`http://localhost:5000/recruiter/editJob/${this.state.job_id}`, {params: {user_id}})
        .then(res => {
            let {message, job} = res.data;
            if(message) this.setState({message, errorOccured: true});
            else this.setState({
                maxapplications: job.maxapplications, 
                maxpositions: job.maxpositions,
                deadline_date: job.deadline.split("T")[0],
                deadline_time: new Date(job.deadline).toLocaleTimeString()
            });
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    onChangeMaxApplications(e){
        this.setState({maxapplications: e.target.value});
    }
    onChangeMaxPositions(e){
        this.setState({maxpositions: e.target.value});
    }
    onChangeDeadlineDate(e){
        this.setState({deadline_date: e.target.value});
    }
    onChangeDeadlineTime(e){
        this.setState({deadline_time: e.target.value});
    }
    onSubmit(e){
        e.preventDefault();
        let user_id = sessionStorage.getItem("user_id");
        let {maxapplications, maxpositions, deadline_date, deadline_time} = this.state;
        let update = {maxapplications, maxpositions, deadline: deadline_date + "T" + deadline_time};
        axios.post(`http://localhost:5000/recruiter/dashboard/edit/${this.state.job_id}`, update, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({errorOccured: true, message: message});
            else window.location = "/recruiter/dashboard"; 
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    render(){
        return(
            <div>
                <h2>{this.state.job_title}</h2>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label><strong>Maximum number of Applications:</strong></label>
                        <input type="number" className="form-control" value={this.state.maxapplications} 
                        onChange={this.onChangeMaxApplications}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Maximum number of positions:</strong></label>
                        <input type="number" className="form-control" value={this.state.maxpositions} 
                        onChange={this.onChangeMaxPositions}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Deadline for Submitting Applications:</strong></label>
                        <input type="date" className="form-control" value={this.state.deadline_date} 
                        onChange={this.onChangeDeadlineDate}/>
                        <input type="time" className="form-control" value={this.state.deadline_time}
                        onChange={this.onChangeDeadlineTime}/>
                    </div>
                    <input type="submit" value="Save" className="btn btn-outline-success" />
                </form>
                <p className={this.state.errorOccured?"alert alert-danger":"alert-success"}>{this.state.message}</p>
            </div>
        );
    }
}