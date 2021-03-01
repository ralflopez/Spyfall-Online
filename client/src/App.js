import React from 'react';
import './style/main.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UserContext from './components/c_user';
import Welcome from './components/Welcome';
import Outdoor from './components/Outdoor';
import Lobby from './components/Lobby';
import Game from './components/Game';

function App() {
  return (
    <UserContext>
        <Router>
        <Switch>
          <Route path="/" exact component={Welcome}/>
          <Route path="/outdoor" component={Outdoor}/>
          <Route path="/lobby" component={Lobby}/>
          <Route path="/game" component={Game}/>
        </Switch>
      </Router>
    </UserContext>
  );
}

export default App;
