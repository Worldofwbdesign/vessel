import React from 'react';
import moment = require('moment');

const actionsMap = ['Delete', 'Update', 'Insert'];

export class PortCallHistory extends React.Component<any, {}> {
  state = {
    history: [],
    loading: false
  };

  componentDidMount() {
    this.fetchHistory();
  }

  fetchHistory() {
    const { portCallId } = this.props;
    this.setState({ loading: true });
    fetch(`/api/port-call-history/${portCallId}`)
      .then(response => response.json())
      .then(history => {
        this.setState({ loading: false, history });
      })
      .catch(error => {
        console.error(error);
        this.setState({ loading: false });
      });
  }

  formatDate = date => moment(date).format('YYYY MMMM DD HH:mm');

  render() {
    const { loading, history } = this.state;
    const lastPortCall = history[history.length - 1];

    return (
      <div>
        {loading && <h2>Loading</h2>}
        {!loading && !history.length && <h2>No history found</h2>}
        {lastPortCall && (
          <h1>
            Port call history for port call {lastPortCall.port_call_id} in port{' '}
            {lastPortCall.portName}
          </h1>
        )}
        {lastPortCall && (
          <h2>
            Arrival: {this.formatDate(lastPortCall.arrival)} / Departure{' '}
            {this.formatDate(lastPortCall.departure)}. Vessel{' '}
            {lastPortCall.vessel.name}
          </h2>
        )}
        <ul>
          {history.map(item => (
            <li key={item.id}>
              <span>Cursor: {this.formatDate(item.cursor)} / </span>
              <span>Action: {actionsMap[item.actionMode || 0]} / </span>
              <span>Arrival: {this.formatDate(item.arrival)} / </span>
              <span>Departure: {this.formatDate(item.departure)}/ </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
