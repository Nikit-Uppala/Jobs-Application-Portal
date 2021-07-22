import axios from 'axios';
import React, {Component} from 'react';

export default class ApplicantRegister extends Component{
    constructor(props){
        super(props);
        this.onChangeEducation = this.onChangeEducation.bind(this);
        this.onChangeSkills = this.onChangeSkills.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            name: props.name,
            email: props.email,
            password: props.password,
            skills: [],
            education: [],
            selected: {},
            languages: ["C", "C++", "PYTHON", "JAVA", "OTHER"],
            errorOccured: false,
            message: ""
        }
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
                    if(ind===index){
                        return newLanguage;
                    }
                    else return element; 
                })});
            }
            else{
                this.setState({skills: [...this.state.skills].map((element, ind) => {
                    if(ind===index) return e.target.value;
                    else return element; 
                })});
            }
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
        const {name, email, password, skills, education} = this.state;
        let len = skills.length;
        let check = {};
        for(let i=0; i<len; i++){
            if(check[skills[i]]) return this.setState({errorOccured: true, message: "Same language selected multiple times!"});
            else check[skills[i]] = true; 
        }
        len = education.length;
        for(let i=0; i<len; i++){
            if(education[i].endyear && education[i].startyear > education[i].endyear) 
                return this.setState({errorOccured: true, message: "End year can't be before start year!"});
        }
        const newUser = {name, email, password, skills, education};
        axios.post("http://localhost:5000/register/applicant", newUser)
        .then(res => {
            let {message, user_id} = res.data;
            if(message) this.setState({errorOccured: true, message: message});
            else{
                this.setState({errorOccured: false, message:""});
                sessionStorage.setItem("user_id", user_id);
                sessionStorage.setItem("type", "applicant");
                window.location = "/applicant/dashboard";
            }
        })
        .catch(err => this.setState({errorOccured: true, message: err.message}))
    }
    render(){
        return(
            <div>
                <h2>Other Details</h2>
                <form onSubmit={this.onSubmit}>
                    <div>
                        <label><strong>Skills:</strong></label>
                        {[...this.state.skills].map((skill, index) => {
                            return(
                                <div className="form-group">
                                <label>{`Language ${index+1}:`}</label>
                                <select className="form-select" 
                                value={this.state.skills[index]}
                                onChange={e => this.onChangeSkills(e, "changed", index)}>
                                    {[...this.state.languages].map((element,ind) => {
                                        return(<option value={element}>{element}</option>);
                                    })}
                                </select>
                                <small> selected:{this.state.skills[index]!==""?this.state.skills[index]:"none"}</small>
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
                                            <input type="text" className="form-control"
                                            value={element.startyear}
                                            onChange={e => this.onChangeEducation(e, ["changed", "startyear"], index)}/>
                                        </div>
                                        <div className="form-group col">
                                            <label>End Year:</label>
                                            <input type="text" className="form-control"
                                            value={element.endyear} 
                                            onChange={e => this.onChangeEducation(e, ["changed", "endyear"], index)}/>
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
                    <input type="submit" className="btn btn-outline-primary" value="Register" />
                    <br/>
                    <br/>
                    <p className={this.state.errorOccured?"alert alert-danger":""}>{this.state.message}</p>
                </form>
            </div>
        );
    }
}