import React from 'react';
import { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerLayer from '../src/MarkerLayer';

const position = { lng: -122.673447, lat: 45.522558 };
const markers = [
  {
    position: { lng: -122.67344700000, lat: 45.522558100000 },
    text: 'Voodoo Doughnut',
  },
  {
    position: { lng: -122.67814460000, lat: 45.5225512000000 },
    text: 'Bailey\'s Taproom',
  },
  {
    position: { lng: -122.67535700000002, lat: 45.5192743000000 },
    text: 'Barista'
  },
  {
    position: { lng: -122.65596570000001, lat: 45.5199148000001 },
    text: 'Base Camp Brewing'
  },
  {
    position: { lng: null, lat: 45.522558100000 },
    text: 'A Malformed Location',
  },
];

const markerToBeAdded = {
  position: { lng: -119.0638890000001, lat: 40.883056000001 },
  text: 'Black Rock City'
};

class ExampleMarkerComponent extends React.Component {

  render() {
    const style = {
      border: 'solid 1px lightblue',
      backgroundColor: '#333333',
      borderRadius: '50%',
      marginTop: '-12px',
      marginLeft: '-12px',
      width: '24px',
      height: '24px'
    };

    return (
      <div style={Object.assign({}, this.props.style, style)}></div>
    );
  }

}

const longitudeExtractor = m => m.position.lng;
const latitudeExtractor = m => m.position.lat;

class MapExample extends React.Component {

  state = {
    mapHidden: false,
    layerHidden: false,
    markers: markers,
    msg: null
  };

  _moveMarker() {
    setTimeout(() => {
      markers[0].position.lng = markers[0].position.lng + 2;
      this.setState({ markers: Array.from(markers) });
    }, 1000 * 1);
  }

  componentDidMount() {
    this._moveMarker();
    setTimeout(() => {
      this.setState({ msg: 'LOL' });
    }, 1000 * 5);
  }

  render() {
    if (this.state.mapHidden) {
      return (
        <div>
          <input type="button" value="Toggle Map" onClick={() => this.setState({ mapHidden: !this.state.mapHidden })} />
        </div>
      );
    }

    return (
      <div>
        <Map center={position} zoom={13}>
          {!this.state.layerHidden && <MarkerLayer
            markers={this.state.markers}
            longitudeExtractor={longitudeExtractor}
            latitudeExtractor={latitudeExtractor}
            markerComponent={ExampleMarkerComponent}
            fitBoundsOnUpdate />}
          <TileLayer
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </Map>
        <input type="button" value="Toggle Map" onClick={() => this.setState({ mapHidden: !this.state.mapHidden })} />
        <input type="button" value="Toggle Layer" onClick={() => this.setState({ layerHidden: !this.state.layerHidden })} />
        {!!this.state.msg && this.state.msg}
      </div>
    );
  }

}

render(<MapExample />, document.getElementById('app'));
