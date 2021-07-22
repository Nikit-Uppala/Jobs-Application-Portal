import React, {Component} from 'react';
import axios from 'axios';
import ReactStars from "react-rating-stars-component";

export default class MyEmployees extends Component{
    constructor(props){
        super(props);
        this.onChangeRating = this.onChangeRating.bind(this);
        this.onChangeOption = this.onChangeOption.bind(this);
        this.state = {
            employees: [],
            errorOccured: false,
            option: "none",
            sort_options: ["none" ,"Name(asc)", "Name(desc)", "Job Title(asc)", "Job Title(desc)", 
            "Date(asc)", "Date(desc)", "Rating(asc)", "Rating(desc)"],
            message: ""
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="applicant") window.location = "/applicant/dashboard";
        axios.get("http://localhost:5000/recruiter/employees", {params: {user_id}})
        .then(res => {
            let {message, employees} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else this.setState({errorOccured: false, message: "", employees});
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    onChangeRating(value, index){
        let confirmation = window.confirm("Are you sure you want to submit the rating? Rating can't be changed");
        if(!confirmation) return;
        let user_id = sessionStorage.getItem("user_id");
        let empid = this.state.employees[index].empid;
        axios.post(`http://localhost:5000/recruiter/giveRating/${empid}`, {rating: value}, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({message, errorOccured: true});
            else window.location.reload(true);
        })
        .catch(err => this.setState({message: err.message, errorOccured:true}));
    }
    onChangeOption(e){
        let option = e.target.value;
        let {sort_options, employees} = this.state;
        if(option.startsWith("Name")){
            if(option===sort_options[1]) employees.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            else employees.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
        }
        else if(option.startsWith("Job")){
            if(option===sort_options[3]) employees.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
            else employees.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
        }
        else if(option.startsWith("Date")){
            if(option===sort_options[5]) employees.sort((a, b) => a.joinDate.localeCompare(b.joinDate));
            else employees.sort((a, b) => b.joinDate.localeCompare(a.joinDate));
        }
        else{
            if(option===sort_options[7]) employees.sort((a, b) => a.empRating-b.empRating);
            else employees.sort((a, b) => b.empRating - a.empRating)
        }
        this.setState({option})
    }
    render(){
        return(
            <div>
                <br/>
                <h2>My Employees</h2>
                <br/>
                <div className="form-group">
                    <label>Sort By:</label>
                    <select className="form-select" value={this.state.option} onChange={this.onChangeOption}>
                        {[...this.state.sort_options].map(element => <option value={element}>{element}</option>)}
                    </select>
                </div>
                <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th>Name</th>
                            <th>Date of joining</th>
                            <th>Job Type</th>
                            <th>Job Title</th>
                            <th>Applicant Rating</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...this.state.employees].map((employee, index) => {
                            let {name, joinDate, jobType, title, rating, empRating} = employee;
                            return(
                                <tr>
                                    <td>{name}</td>
                                    <td>{joinDate}</td>
                                    <td>{jobType}</td>
                                    <td>{title}</td>
                                    <td>{empRating}</td>
                                    <td><ReactStars value={rating} edit={rating===0} size={25} 
                                    onChange={value => this.onChangeRating(value, index)}/></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}