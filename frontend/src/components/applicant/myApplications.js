import React, {Component} from 'react';
import axios from  'axios';
import ReactStars from "react-rating-stars-component";

export default class MyApplications extends Component{
    constructor(props){
        super(props);
        this.state = {
            applications: [],
            errorOccured: false,
            message: ""
        }
    };
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="recruiter") window.location = "/recruiter/dashboard";
        axios.get("http://localhost:5000/applicant/myapplications", {params: {user_id}})
        .then(res => {
            let {message, applications} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else this.setState({errorOccured: false, message: "", applications});
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    onChangeRating(value, index){
        let user_id = sessionStorage.getItem("user_id");
        if(window.confirm("Are you sure you want to submit the rating? It can't be changed later"));
        axios.post(`http://localhost:5000/applicant/giveRating/${this.state.applications[index].id}`, {rating: value}, {params: {user_id}})
        .then(res => {
            let {message} = res.data;
            if(message) this.setState({errorOccured: true, message});
            else window.location.reload(true);
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}));
    }
    render(){
        return(
            <div>
                <br/>
                <h2>My Applications</h2>
                <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Date of joining</th>
                            <th>Salary</th>
                            <th>Recruiter Name</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                            {[...this.state.applications].map((application, index) => {
                                const {title, joinDate, recname, salarypermonth, canRate, rating, status} = application;
                                let date = "-";
                                if(joinDate!=="-") date = new Date(joinDate).toLocaleDateString();
                                return(
                                    <tr>
                                        <td>{title}</td>
                                        <td>{status}</td>
                                        <td>{date}</td>
                                        <td>{salarypermonth}</td>
                                        <td>{recname}</td>
                                        <td><ReactStars count={5} value={rating} size={25} edit={canRate && rating===0}
                                        onChange={value => this.onChangeRating(value, index)}/></td>
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