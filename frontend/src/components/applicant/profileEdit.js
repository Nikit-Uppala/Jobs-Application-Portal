import React, {Component} from 'react';
import axios from 'axios';

export default class ProfileEdit extends Component{
    constructor(props){
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeSkills = this.onChangeSkills.bind(this);
        this.onChangeEducation = this.onChangeEducation.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            name: "",
            email: "",
            skills: [],
            education: [],
            languages: [],
            message: "",
            errorOccured: false,
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let type = sessionStorage.getItem("type");
        if(!user_id) window.location = "/login";
        if(type==="recruiter") window.location = "/recruiter/profile";
        axios.get("http://localhost:5000/applicant/profile", {params: {user_id}})
        .then(profile => {
            let {data} = profile;
            if(data.message) this.setState({message: data.message});
            else{
                let {name, email, skills, education} = data.user;
                this.setState({name, email, skills, education});
                this.setState({languages: ["C", "C++", "PYTHON", "JAVA", "OTHER"]});
            }
        })
    }
    onChangeName(e){
        this.setState({name: e.target.value});
    }
    onChangeEmail(e){
        this.toUpperCase().setState({email: e.target.value});
    }
    onChangeEducation(e, type, index){
        if(type[0]==="add")
            this.setState({education: [...this.state.education, {instiname: "", startyear: "", endyear: ""}]});
        else if(type[0]==="delete")
        {
            let presentEducation = this.state.education;
            presentEducation.splice(index, 1);
            this.setState({education: presentEducation});
        }
        else{
            if(type[1]==='instiname')
                this.setState({education: [...this.state.education].map((element, ind) => {
                    if(ind===index) element.instiname = e.target.value;
                    return element;
                })});
            if(type[1]==='startyear')
                this.setState({education: [...this.state.education].map((element, ind) => {
                    if(ind===index) element.startyear = e.target.value;
                    return element;
                })});
            if(type[1]==='endyear')
                this.setState({education: [...this.state.education].map((element, ind) => {
                    if(ind===index) element.endyear = e.target.value;
                    return element;
                })});
        }
    }
    onChangeSkills(e, type, index){
        if(type==="add")
            this.setState({skills: [...this.state.skills, ""]})
        else if(type==="changed")
        {
            if(e.target.value === "OTHER")
            {
                let newLanguage = "";
                while(newLanguage.length===0)
                {
                    newLanguage = prompt("Enter the name of the language");
                    if(newLanguage===null) return;
                    newLanguage = newLanguage.trim().toUpperCase();
                    if(newLanguage.length===0) alert("Please enter a valid name");
                }
                this.setState({skills: [...this.state.skills].map((element, ind) => {
                    if(ind===index) return newLanguage;
                    else return element; 
                })});
            }
            else
                this.setState({skills: [...this.state.skills].map((element, ind) => {
                    if(ind===index) return e.target.value;
                    else return element; 
                })});
        }
            else if(type==='delete')
        {
            let presentSkills = this.state.skills;
            presentSkills.splice(index, 1);
            this.setState({skills: presentSkills});
        }
    }
    onSubmit(e){
        e.preventDefault();
        const {name, email, skills, education} = this.state;
        const updatedProfile = {
            name, email, skills, education
        }
        let len = skills.length;
        let check = {};
        for(let i=0; i<len; i++){
            if(check[skills[i]]) return this.setState({errorOccured: true, message: "Same language selected multiple times!"});
            else check[skills[i]] = true; 
        }
        len = education.length;
        let presentYear = new Date(Date.now()).getFullYear();
        for(let i=0; i<len; i++){
            if(!education[i].instiname || !education[i].startyear)
                return this.setState({errorOccured: true, message: "Please enter all the fields"});
            if(Number(education[i].startyear) > presentYear)
                return this.setState({errorOccured: true, message: "Start Year can't be greater than " + presentYear});
            if(education[i].endyear && education[i].startyear > education[i].endyear) 
                return this.setState({errorOccured: true, message: "End year can't be before start year!"});
        }
        let user_id = sessionStorage.getItem("user_id");
        axios.post("http://localhost:5000/applicant/profile/edit", updatedProfile, {params: {user_id}})
        .then(res => {
            let {data} = res;
            if(data.message) this.setState({errorOccured: true, message: data.message})
            else{
                this.setState({errorOccured: false, message: ""});
                alert("Profile is updated");
                window.location = "/applicant/profile";
            }
        })
    }
    render(){
        return(
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label><strong>Name:</strong></label>
                        <input type="text" className="form-control" 
                        value={this.state.name} onChange={this.onChangeName}/>
                    </div>
                    <div className="form-group">
                        <label><strong>Email:</strong></label>
                        <input type="email" className="form-control" 
                        value={this.state.email} onChange={this.onChangeEmail}/>
                    </div>
                    <div>
                        <label><strong>Skills:</strong></label>
                        {[...this.state.skills].map((skill, index) => {
                            return(
                                <div className="form-group">
                                <label>{`Language ${index+1}:`}</label>
                                <select className="form-select" value={this.state.skills[index]}
                                onChange={e => this.onChangeSkills(e, "changed", index)}>
                                    {[...this.state.languages].map((element,ind) => {
                                        return(<option value={element}>{element}</option>);
                                    })}
                                </select>
                                <small> selected: {this.state.skills[index]!==""?this.state.skills[index]:"none"} </small>
                                <br/>
                                <button type="button" className="btn btn-outline-danger" 
                                onClick={e=> this.onChangeSkills(e, "delete", index)}>Delete</button>
                            </div>
                            );
                        })}
                        <button type ="button" className="btn btn-outline-primary" 
                        onClick={e => this.onChangeSkills(e, "add", -1)}>Add skill</button>
                    </div>
                    <br/>
                    <div>
                        <label><strong>Education details:</strong></label>
                        {[...this.state.education].map((element, index)=>{
                            return(
                                <div>
                                    <div className="form-row">
                                        <div className="form-group col">
                                            <label>Institute Name:</label>
                                            <input type="text" className="form-control"
                                            value={element.instiname} 
                                            onChange={e => this.onChangeEducation(e, ["changed", "instiname"], index)}/>
                                        </div>
                                        <div className="form-group col">
                                            <label>Start Year:</label>
                                            <input type="tel" pattern="[0-9]{4}" className="form-control"
                                            value={element.startyear}
                                            onChange={e => this.onChangeEducation(e, ["changed", "startyear"], index)}/>
                                            <small>format: YYYY</small>
                                        </div>
                                        <div className="form-group col">
                                            <label>End Year:</label>
                                            <input type="tel" pattern="[0-9]{4}" className="form-control"
                                            value={element.endyear} 
                                            onChange={e => this.onChangeEducation(e, ["changed", "endyear"], index)}/>
                                            <small>format: YYYY</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-outline-danger"
                                    onClick={e => this.onChangeEducation(e, ["delete"], -1)}>Delete</button>
                                    <br/>
                                </div>
                            );
                        })}
                        <br/>
                        <button type ="button" className="btn btn-outline-primary" 
                        onClick={e => this.onChangeEducation(e, ["add"], -1)}>Add education details</button>
                    </div>
                    <br/>
                    <input type="submit" value="Save" className="btn btn-outline-success"/>
                </form>
                <br/>
                <p className={this.state.errorOccured?"alert alert-danger": "alert-success"}>{this.state.message}</p>
            </div>
        );
    }
}