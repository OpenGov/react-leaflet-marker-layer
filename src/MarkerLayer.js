import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import min from 'lodash/min';
import max from 'lodash/max';
import isNumber from 'lodash/isNumber';
import filter from 'lodash/filter';
import L from 'leaflet';
import {MapLayer} from 'react-leaflet';

export type LngLat = {
  lng: number;
  lat: number;
}

export type Point = {
  x: number;
  y: number;
}

export type Map = {
  layerPointToLatLng: (lngLat: Point) => LngLat;
  latLngToLayerPoint: (lngLat: LngLat) => Point;
  on: (event: string, handler: () => void) => void;
  getPanes: () => Panes;
  invalidateSize: () => void;
}

export type Panes = {
  overlayPane: Pane;
}

export type Pane = {
  appendChild: (element: Object) => void;
}

function isInvalid(num: number): boolean {
  return !isNumber(num) && !num;
}

function isValid(num: number): boolean {
  return !isInvalid(num);
}

function shouldIgnoreLocation(loc: LngLat): boolean {
  return isInvalid(loc.lng) || isInvalid(loc.lat);
}

export default class MarkerLayer extends MapLayer {
  static propTypes = {
    markers: PropTypes.array,
    longitudeExtractor: PropTypes.func.isRequired,
    latitudeExtractor: PropTypes.func.isRequired,
    markerComponent: PropTypes.func.isRequired,
    propsForMarkers: PropTypes.object,
    fitBoundsOnLoad: PropTypes.bool,
    fitBoundsOnUpdate: PropTypes.bool,
  };

  map: Object = null;
  markers: Object = {};
  container = null;

  constructor(props, context) {
    super(props, context);
    this.map = (undefined !== props.map) ? props.map : context.map;
  }

  createLeafletElement(props: Object): Object {
    return null
  }

  componentWillReceiveProps() {
    // no-op to override MapLayer behavior
  }

  componentDidMount(): void {
    this.leafletElement = ReactDOM.findDOMNode(this.container);
    this.map.getPanes().overlayPane.appendChild(this.leafletElement);
    if (this.props.fitBoundsOnLoad) {
      this.fitBounds();
    }
    this.attachEvents();
    this.updatePosition();
  }

  componentWillUnmount(): void {
    this.map.getPanes().overlayPane.removeChild(this.leafletElement);
  }

  fitBounds(): void {
    const markers = this.props.markers;
    const lngs = filter(map(markers, this.props.longitudeExtractor), isValid);
    const lats = filter(map(markers, this.props.latitudeExtractor), isValid);
    const ne = {lng: max(lngs), lat: max(lats)};
    const sw = {lng: min(lngs), lat: min(lats)};

    if (shouldIgnoreLocation(ne) || shouldIgnoreLocation(sw)) {
      return;
    }

    this.map.fitBounds(L.latLngBounds(L.latLng(sw), L.latLng(ne)));
  }

  markersOrPositionExtractorsChanged(props): boolean {
    return this.props.markers !== props.markers
        || this.props.longitudeExtractor !== props.longitudeExtractor
        || this.props.latitudeExtractor !== props.latitudeExtractor;
  }

  componentDidUpdate(prevProps): void {
    this.map.invalidateSize();
    if (this.props.fitBoundsOnUpdate && this.markersOrPositionExtractorsChanged(prevProps)) {
      this.fitBounds();
    }
    this.updatePosition();
  }

  attachEvents(): void {
    this.map.on('zoomend', this.updatePosition.bind(this));
    this.map.on('viewreset', this.updatePosition.bind(this));
  }

  getLocationForMarker(marker): LngLat {
    return {
      lat: this.props.latitudeExtractor(marker),
      lng: this.props.longitudeExtractor(marker)
    };
  }

  updatePosition(): void {
    forEach(this.props.markers, (marker, i) => {
      const markerComponent = this.markers[this.getMarkerRefName(i)];

      if(!markerComponent || !markerComponent.ref) {
        throw new Error('Missing reference: Please add a reference to your Marker element, by adding \'ref={(c) => this.ref = c}\' to your marker\'s root tag')
      }

      const markerElement = ReactDOM.findDOMNode(markerComponent.ref);

      const location = this.getLocationForMarker(marker);

      if (!markerElement || shouldIgnoreLocation(location)) {
        return;
      }

      const point = this.map.latLngToLayerPoint(L.latLng(location));

      L.DomUtil.setPosition(markerElement, point);
    });
  }

  render(): React.Element {
    return (
        <div ref={(c) => this.container = c}
             className={`leaflet-objects-pane
           leaflet-marker-pane
           leaflet-zoom-hide
           react-leaflet-marker-layer`}>
          {this.renderMarkers()}
        </div>
    );
  }

  renderMarkers(): Array<React.Element> {
    const style = {position: 'absolute'};
    const MarkerComponent = this.props.markerComponent;
    return map(this.props.markers, (marker, index: number) => {
      if (shouldIgnoreLocation(this.getLocationForMarker(marker))) {
        return;
      }

      return (
          <MarkerComponent
              {...this.props.propsForMarkers}
              key={index}
              style={style}
              map={this.map}
              ref={(c) => this.markers[this.getMarkerRefName(index)] = c}
              marker={marker}/>
      );
    });
  }

  getMarkerRefName(index: number): string {
    return `marker-${index}`;
  }

}