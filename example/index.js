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
  }
];

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
      <div style={style}></div>
    );
  }

}

class MapExample extends React.Component {

  state = {
    mapHidden: false
  };

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
          <MarkerLayer
            markers={markers}
            longitudeExtractor={m => m.position.lng}
            latitudeExtractor={m => m.position.lat}
            markerComponent={ExampleMarkerComponent} />
          <TileLayer
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </Map>
        <input type="button" value="Toggle Map" onClick={() => this.setState({ mapHidden: !this.state.mapHidden })} />
      </div>
    );
  }

}

render(<MapExample />, document.getElementById('app'));
