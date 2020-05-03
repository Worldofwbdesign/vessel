import React from 'react';
import { Link } from '@reach/router';

interface State {
  vessels: {
    imo: number;
    name: string;
  }[];
  import: null | {
    status: string;
    message: string;
  };
}

export class VesselList extends React.Component<any, State> {
  constructor(props) {
    super(props);

    this.state = {
      vessels: [],
      import: null
    };
  }

  componentDidMount() {
    this.renderVessels();
  }

  renderVessels() {
    fetch('/api/vessels')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ vessels: responseJson });
      })
      .catch(error => {
        console.error(error);
      });
  }

  importAll() {
    fetch('/api/import', {
      method: 'POST'
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({ import: responseJson });
      })
      .catch(error => {
        console.error(error);
        this.setState({ import: { status: 'ko', message: error.message } });
      });
  }

  render() {
    return (
      <div>
        <h1>Vessels</h1>
        <button onClick={() => this.importAll()}>Run the full import</button>
        {this.state.import && this.state.import.status === 'ok' && (
          <p>Import has started</p>
        )}
        {this.state.import && this.state.import.status !== 'ok' && (
          <p>{this.state.import.message}</p>
        )}
        <ul>
          {this.state.vessels.map(v => (
            <li key={v.imo}>
              <Link to={`/vessel-schedule/${v.imo}`}>
                {v.name} ({v.imo})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
