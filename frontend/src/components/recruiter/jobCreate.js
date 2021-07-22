import React, {Component} from 'react';
import axios from 'axios';

export default class JobCreate extends Component{
    constructor(props){
        super(props);
        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeMaxApplications = this.onChangeMaxApplications.bind(this);
        this.onChangeMaxPositions = this.onChangeMaxPositions.bind(this);
        this.onChangeDeadlineDate = this.onChangeDeadlineDate.bind(this);
        this.onChangeDeadlineTime = this.onChangeDeadlineTime.bind(this);
        this.onChangeSkillSets= this.onChangeSkillSets.bind(this);
        this.onChangeJobType = this.onChangeJobType.bind(this);
        this.onChangeSalary = this.onChangeSalary.bind(this);
        this.onChangeDuration = this.onChangeDuration.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            title: "",
            maxapplications: 0,
            maxpositions: 0,
            deadline_date: "",
            deadline_time: "",
            skillsets: "",
            jobType: "",
            salarypermonth: 0,
            duration: 0,
            errorOccured: false,
            message: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.location = "/applicant/dashboard";
    }
    onChangeTitle(e){
        this.setState({title: e.target.value});
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
    onChangeJobType(e){
        this.setState({jobType: e.target.value});
    }
    onChangeSalary(e){
        this.setState({salarypermonth: e.target.value});
    }
    onChangeDuration(e){
        this.setState({duration: e.target.value});
    }
    onChangeSkillSets(e){
        this.setState({skillsets: e.target.value});
    }
    onSubmit(e){
        e.preventDefault();
        const {title, maxapplications, maxpositions, deadline_date, deadline_time, skillsets, jobType, salarypermonth, duration} = this.state;
        let deadline = deadline_date + "T" +deadline_time;
        let skillSets = [...skillsets.split(",").map(element => element.trim())]
        const newJob = {
            title, maxapplications, maxpositions, deadline, skillsets: skillSets,
            jobType, salarypermonth, duration
        }
        let user_id = sessionStorage.getItem("user_id");
        axios.post("http://localhost:5000/recruiter/dashboard/create", newJob, {params: {user_id}})
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
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label><strong>Title:</strong></label>
                        <input type="text" className="form-control" value={this.state.title} 
                        onChange={this.onChangeTitle}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Maximum number of applications:</strong></label>
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
                    <div className="form-group">
                        <label><strong>Required Skill Sets(seperate by commas):</strong></label>
                        <textarea className="form-control" value={this.state.skillsets} 
                        onChange={this.onChangeSkillSets}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Job Type:</strong></label>
                        <select className="form-select" onChange={this.onChangeJobType}>
                            <option value="Choose" disabled selected>Choose</option>
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="wfh">Work From Home</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label><strong>Duration:</strong></label>
                        <select className="form-select" onChange={this.onChangeDuration}>
                            <option value={0}>0 (indefinite)</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label><strong>Salary Per Month:</strong></label>
                        <input type="number" className="form-control" value={this.state.salarypermonth} 
                        onChange={this.onChangeSalary}/>
                    </div>
                    <input type="submit" className="btn btn-outline-success" value="Create"/>
                </form>
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger": ""}>{this.state.message}</p>
            </div>
        );
    }
}