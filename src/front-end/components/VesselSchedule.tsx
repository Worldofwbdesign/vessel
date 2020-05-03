import React from 'react';
import { Link } from '@reach/router';
import moment from 'moment';

export class VesselSchedule extends React.Component<any, {}> {
  state = {
    schedule: [],
    loading: false
  };

  componentDidMount() {
    this.fetchSchedule();
  }

  fetchSchedule() {
    this.setState({ loading: true });
    fetch(`/api/vessel-schedule/${this.props.vesselImo}`)
      .then(response => response.json())
      .then(schedule => {
        this.setState({ loading: false, schedule });
      })
      .catch(error => {
        console.error(error);
        this.setState({ loading: false });
      });
  }

  formatDate = date => moment(date).format('YYYY MMMM DD HH:mm');

  render() {
    const { schedule, loading } = this.state;
    const { vessel = {} } = schedule[0] || {};

    return (
      <div>
        {loading && <h2>Loading</h2>}
        {!loading && !schedule.length && <h2>No schedules found</h2>}
        {vessel.imo && (
          <h1>
            Vessel Schedule for {vessel.name} ({vessel.imo})
          </h1>
        )}
        <ul>
          {schedule.map(item => (
            <li className="item" key={item.id}>
              <Link to={`/port-call-history/${item.id}`}>
                {item.portName}.{' '}
              </Link>
              <span>Arrival: {this.formatDate(item.arrival)}. </span>
              <span>Departure: {this.formatDate(item.departure)}</span>
              {item.isDeleted && <span> (deleted)</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
