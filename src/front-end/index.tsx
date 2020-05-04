//declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');
import { Router, Link } from '@reach/router';
import { VesselList } from './components/VesselList';
import { VesselSchedule } from './components/VesselSchedule';
import { PortCallHistory } from './components/PortCallHistory';

export const App = () => {
  return (
    <Router>
      <VesselList path="/" />
      <VesselSchedule path="/vessel-schedule/:vesselImo" />
      <PortCallHistory path="/port-call-history/:portCallId" />
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
