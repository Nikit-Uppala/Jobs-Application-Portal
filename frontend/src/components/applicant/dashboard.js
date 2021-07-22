import React, { Component } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Fuse from 'fuse.js';

const JobComponent = function(props){
    let {title, recname, duration, salarypermonth, status, id, rating, deadline, 
    applicationsRecieved, maxapplications, skillsets, jobType} = props.job;
    if(jobType==="wfh") jobType = "Work From Home";
    else if(jobType==="part-time") jobType = "Part-Time";
    else jobType = "Full-Time";
    let {isAccepted} = props;
    let button;
    deadline = new Date(deadline);
    let date = deadline.toLocaleDateString();
    if(status==="applied")
        button = <button type="button" disabled className="badge-lg badge-info float-right">Applied</button>
    else if(status==="shortlisted")
        button = <button type="button" disbaled className="badge-lg badge-dark float-right">Shortlisted</button>
    else if(status==="rejected")
        button = <button type="button" disabled className="badge-lg badge-danger float-right">Rejected</button>
    else if(status==="accepted")
        button = <button type="button" disabled className="badge-lg badge-success float-right">Accepted</button>
    else if(applicationsRecieved===maxapplications)
        button = <button type="button" disabled className="badge-lg badge-warning float-right">Not Accepting Applications</button>
    else if(isAccepted && status==="apply")
        button = <button type="button" disabled className="badge-lg badge-secondary float-right" >You are already in a job</button>
    else if(status==="apply") 
    button = <Link to={
        {
            pathname: `/applicant/dashboard/apply/${id}/${title}`,
        }} className="btn btn-primary float-right">
        Apply<br/>
        <small>Deadline:{date}</small>
        </Link>
    return(
        <div className="card">
            <div className="card-body">
                <h3 className="card-title">{title}</h3>
                <div>
                    <label><strong>Recruiter Name:</strong></label>
                    <span>{recname}</span>
                </div>
                <div>
                    <label><strong>Job Type:</strong></label>
                    <span>{jobType}</span>
                </div>
                <div>
                    <label><strong>Rating:</strong></label>
                    <span>{rating.toFixed(1)}</span>
                </div>
                <div>
                    <label><strong>Salary:</strong></label>
                    <span>{salarypermonth}</span>
                </div>
                <div>
                    <label><strong>Required Skills:</strong></label>
                    <span>{skillsets.join(",")}</span>
                </div>
                <div>
                    <label><strong>Duration:</strong></label>
                    <span>{duration}</span>
                </div>
                {button}
            </div>
        </div>
    );
}

export default class Dashboard extends Component{
    constructor(props){
        super(props);
        this.onChangeSortBy = this.onChangeSortBy.bind(this);
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.onChangeFT = this.onChangeFT.bind(this);
        this.onChangePT = this.onChangePT.bind(this);
        this.onChangeWFH = this.onChangeWFH.bind(this);
        this.onChangeMinSalary = this.onChangeMinSalary.bind(this);
        this.onChangeMaxSalary = this.onChangeMaxSalary.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.onChangeDurationFilter = this.onChangeDurationFilter.bind(this);
        this.state = {
            AllJobs: [],
            jobs: [],
            isAccepted: false,
            errorOccured: false,
            message: "",
            search: "",
            sortBy: "none",
            options: ["none", "salary(inc)", "salary(dec)", "duration(inc)", "duration(dec)", "rating(inc)", "rating(dec)"],
            checkedFT: true,
            checkedWFH: true,
            checkedPT: true,
            minSalary: 0,
            maxSalary: 0,
            duarationFilter: 7,
        };
        this.fuse = null;
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="recruiter") window.location = "/recruiter/dashboard";
        axios.get("http://localhost:5000/applicant/dashboard", {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message){ 
                this.setState({errorOccured: true, message: message});
                return;
            }
            let jobs = res.data.jobs, isAccepted = res.data.isAccepted;
            if(!jobs || jobs.length===0) this.setState({errorOccured: true, message: "No jobs found", isAccepted});
            else{
                let len = jobs.length;
                let maxSalary = 0;
                for(let i=0; i<len; i++) if(jobs[i].salarypermonth>maxSalary) maxSalary=jobs[i].salarypermonth;
                this.setState({errorOccured: false, message: "", AllJobs: jobs, jobs: jobs, maxSalary, isAccepted});
                this.fuse = new Fuse(jobs, {keys:["title"]});
            }
        })
    }
    onChangeDuration(e){
        this.setState({duarationFilter: e.target.value});
    }
    onChangeMaxSalary(e){
        this.setState({maxSalary: e.target.value});
    }
    onChangeMinSalary(e){
        this.setState({minSalary: e.target.value});
    }
    onChangeFT(e){
        let newState = !this.state.checkedFT;
        this.setState({checkedFT: newState});
    }
    onChangePT(e){
        this.setState({checkedPT: !this.state.checkedPT});
    }
    onChangeWFH(e){
        this.setState({checkedWFH: !this.state.checkedWFH});
    }
    onChangeDurationFilter(e){
        this.setState({duarationFilter: e.target.value});
    }
    onChangeSearch(e){
        let query = e.target.value.trim();
        if(query.length===0) this.setState({jobs: this.state.AllJobs});
        else{
            let results = this.fuse.search(query);
            this.setState({jobs: [...results].map(element => element.item)});
        }
        this.setState({search: query});
    }
    onChangeSortBy(e){
        let sortBy = e.target.value;
        let {jobs, options} = this.state;
        if(sortBy.startsWith("salary"))
        {
            if(sortBy===options[1]) jobs.sort((a, b) => a.salarypermonth - b.salarypermonth);
            else jobs.sort((a, b) => b.salarypermonth - a.salarypermonth)
        }
        else if(sortBy.startsWith("duration"))
        {
            if(sortBy===options[3]) jobs.sort((a, b) => a.duration - b.duration);
            else jobs.sort((a, b) => b.duration - a.duration);
        }
        else{
            if(sortBy===options[5]) jobs.sort((a, b) => a.rating - b.rating);
            else jobs.sort((a, b) => b.rating - a.rating);
        }
        this.setState({sortBy: e.target.value});
    }
    applyFilter(e){
        e.preventDefault();
        let {checkedFT, checkedPT, checkedWFH} = this.state;
        let jobTypes = [];
        if(checkedFT) jobTypes.push("full-time");
        if(checkedPT) jobTypes.push("part-time");
        if(checkedWFH) jobTypes.push("wfh");
        let len = jobTypes.length;
        let {minSalary, maxSalary, duarationFilter} = this.state;
        this.setState({jobs: this.state.AllJobs.filter(job => {
                let k =0;
                while(k<len && job.jobType!==jobTypes[k]) k++;
                if(k>=len) return false;
                if(job.salarypermonth<minSalary || job.salarypermonth>maxSalary) return false;
                if(job.duration>=duarationFilter) return false;
                return true;
            })
        });
    }
    render(){
        let numbers = [1, 2, 3, 4, 5, 6, 7];
        return(
            <div>
                <br/>
                <input type="search" className="form-control" value={this.state.search} 
                onChange={this.onChangeSearch} placeholder="Search"/>
                <br/><br/>
                <div className="form-group">
                    <label><strong> Sort By: </strong></label>
                    <select className="form-select" value={this.sortBy} onChange={this.onChangeSortBy}>
                        {[...this.state.options].map(element => {
                            return(<option value={element}>{element}</option>);
                        })}
                    </select>
                </div>
                <br/>
                <form onSubmit={this.applyFilter}>
                    <div className="form-group">
                        <label><strong>Filters:</strong></label>
                        <div className="row">
                            <div className="col">
                                <label>Job Type:</label>
                                <div className="container">
                                    <input type="checkbox" onChange={this.onChangeFT} 
                                    className="form-check-input" checked={this.state.checkedFT}/>
                                    <label className="form-check-label">Full Time</label>
                                </div>
                                <div className="container">
                                    <input type="checkbox" onChange={this.onChangePT} 
                                    className="form-check-input" checked={this.state.checkedPT}/>
                                    <label className="form-check-label">Part Time</label>
                                </div>
                                <div className="container">
                                    <input type="checkbox" onChange={this.onChangeWFH}
                                    className="form-check-input" checked={this.state.checkedWFH}/>
                                    <label className="form-check-label">Work From Home</label>
                                </div>
                            </div>
                            <div className="col">
                                <label>Salary:</label>
                                <div className="row">
                                    <div className="col">
                                        <input type="number" min={0} max={this.state.maxSalary} 
                                        className="form-control" value={this.state.minSalary}
                                        onChange={this.onChangeMinSalary}/>
                                        <small>(min)</small>
                                    </div>
                                    <div className="col">
                                        <input type="number" min={this.state.minSalary} 
                                        className="form-control" value={this.state.maxSalary}
                                        onChange={this.onChangeMaxSalary}/>
                                        <small>(max)</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <label>Duration(less than):</label>
                                <select className="form-select" value={this.state.duarationFilter}
                                onChange={this.onChangeDurationFilter}>
                                    {[...numbers].map(element => <option value={element}> {element} months</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <input type="submit" className="btn btn-primary" value="Filter"/>
                </form>
                <br/>
                {[...this.state.jobs].map(element => {
                    return(<div><JobComponent job={element} isAccepted={this.state.isAccepted}/><br/></div>);
                })}
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger":""}>{this.state.message}</p>
            </div>
        );
    }
}