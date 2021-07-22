import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import CommonNavBar from "./commonNavBar";

class Login extends Component {
    constructor(props){
        super(props);

        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            email: "",
            password: "",
            message:"",
            error: false
        }
    }
    componentDidMount(){
        let user_id = sessionStorage.getItem("user_id");
        let user_type = sessionStorage.getItem("type");
        if(user_id) window.location = `/${user_type}/dashboard`;
    }
    onChangeEmail(e){
        this.setState({email: e.target.value});
    }
    onChangePassword(e){
        this.setState({password: e.target.value});
    }
    onSubmit(e){
        e.preventDefault();
        const credentials = {
            email: this.state.email,
            password: this.state.password
        };
        axios.post("http://localhost:5000/login", credentials)
        .then(response => {
            let data = response.data;
            if(data.message) {this.setState({error: true, message: data.message}); return;}
            else this.setState({error: false});
            sessionStorage.setItem("user_id", data.user_id);
            sessionStorage.setItem("type", data.type);
            window.location.href = `/${data.type}/dashboard`;
        })
        .catch(err => this.setState({error: true, message: err.message}));
    }
    render(){
        return(
            <div>
                <CommonNavBar/>
                <div className="container">
                    <br/><br/>
                    <h4>Login</h4>
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <input type="email" className="form-control"
                            value={this.state.email} onChange={this.onChangeEmail} placeholder="E-mail"/>
                        </div>
                        <br/>
                        <div className="form-group">
                            <input type="password" className="form-control"
                            value={this.state.password} onChange={this.onChangePassword} placeholder="Password"/>
                        </div>
                        <input type="submit" className="btn btn-outline-primary" value="Login"/>
                    </form>
                    <br/>
                    <span className={this.state.error?"alert alert-danger":"alert-danger"}>{this.state.message}</span>
                </div>
            </div>
        );
    }
}

export default Login;