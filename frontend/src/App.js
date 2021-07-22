import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/dist/jquery.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from "./components/common/login";
import Applicant from "./components/applicant/applicant";
import Recruiter from "./components/recruiter/recruiter";
import Register from "./components/common/register";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
        <Route path="/login" exact component={Login}/>
        <Route path="/register" exact component={Register}/>
        <Route path="/applicant/:route1/:route2?/:id?/:title?" exact component={Applicant}/>
        <Route path="/recruiter/:route1/:route2?/:id?/:title?" exact component={Recruiter}/>
        <Route render={() => <Redirect to="/login"/>}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
