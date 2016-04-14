# react-leaflet-marker-layer

`react-leaflet-marker-layer` provides a simple `<MarkerLayer />` component for plotting React components as markers in a `react-leaflet` map.

![A screenshot of markers on a leaflet map](../master/screenshot.jpg?raw=true)

## Usage

```js
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
      <div style={Object.assign({}, this.props.style, style)}></div>
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
```

## API

The `MarkerLayer` component takes the following props:

- `markers`: an array of objects to be plotted
- `longitudeExtractor`: a function that returns the marker object's longitude e.g. `marker => marker.lng`
- `latitudeExtractor`: a function that returns the marker object's latitude e.g. `marker => marker.lat`
- `markerComponent`: (required) the React component to be rendered for each marker, this component will receive the following props
  - `marker`: the object from the `markers` array
  - `style`: a style object for positioning, you should include these styles on your component
  - `map`: the Leaflet map object from the `react-leaflet` `MapLayer`
  - `...propsForMarkers`: the component will also receive the properties of `propsForMarkers` as props
- `propsForMarkers`: props to pass on to marker components

## Example

To try the example:

1. Clone this repository
2. run `npm install` in the root of your cloned repository
3. run `npm run example`
4. Visit [localhost:8000](http://localhost:8000)

## Contributing

See [CONTRIBUTING.md](https://www.github.com/OpenGov/react-leaflet-marker-layer/blob/master/CONTRIBUTING.md)

## License

`react-leaflet-marker-layer` is MIT licensed.

See [LICENSE.md](https://www.github.com/OpenGov/react-leaflet-marker-layer/blob/master/LICENSE.md) for details.
