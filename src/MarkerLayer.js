import React from 'react';
import ReactDOM from 'react-dom';
import map from 'lodash.map';
import forEach from 'lodash.foreach';
import pluck from 'lodash.pluck';
import min from 'lodash.min';
import max from 'lodash.max';
import isNumber from 'lodash.isnumber';
import filter from 'lodash.filter';
import L from 'leaflet';
import { MapLayer } from 'react-leaflet';
import shouldPureComponentUpdate from 'react-pure-render/function';

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
    markers: React.PropTypes.array,
    longitudeExtractor: React.PropTypes.func.isRequired,
    latitudeExtractor: React.PropTypes.func.isRequired,
    markerComponent: React.PropTypes.func.isRequired,
    propsForMarkers: React.PropTypes.object,
    fitBoundsOnLoad: React.PropTypes.bool,
    fitBoundsOnUpdate: React.PropTypes.bool,
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  componentWillReceiveProps() {
    // no-op to override MapLayer behavior
  }

  componentDidMount(): void {
    this.leafletElement = ReactDOM.findDOMNode(this.refs.container);
    this.props.map.getPanes().overlayPane.appendChild(this.leafletElement);
    if (this.props.fitBoundsOnLoad) {
      this.fitBounds();
    }
    this.attachEvents();
    this.updatePosition();
  }

  componentWillUnmount(): void {
    this.props.map.getPanes().overlayPane.removeChild(this.leafletElement);
  }

  fitBounds(): void {
    const markers = this.props.markers;
    const lngs = filter(map(markers, this.props.longitudeExtractor), isValid);
    const lats = filter(map(markers, this.props.latitudeExtractor), isValid);
    const ne = { lng: max(lngs), lat: max(lats) };
    const sw = { lng: min(lngs), lat: min(lats) };

    if (shouldIgnoreLocation(ne) || shouldIgnoreLocation(sw)) {
      return;
    }

    this.props.map.fitBounds(L.latLngBounds(L.latLng(sw), L.latLng(ne)));
  }

  markersOrPositionExtractorsChanged(props): boolean {
    return this.props.markers !== props.markers
      || this.props.longitudeExtractor !== props.longitudeExtractor
      || this.props.latitudeExtractor !== props.latitudeExtractor;
  }

  componentDidUpdate(prevProps): void {
    this.props.map.invalidateSize();
    if (this.props.fitBoundsOnUpdate && this.markersOrPositionExtractorsChanged(prevProps)) {
      this.fitBounds();
    }
    this.updatePosition();
  }

  attachEvents(): void {
    const map: Map = this.props.map;
    map.on('viewreset', () => this.updatePosition());
  }

  getLocationForMarker(marker): LngLat {
    return {
      lat: this.props.latitudeExtractor(marker),
      lng: this.props.longitudeExtractor(marker)
    };
  }

  updatePosition(): void {
    forEach(this.props.markers, (marker, i) => {
      const markerElement = ReactDOM.findDOMNode(
        this.refs[this.getMarkerRefName(i)]
      );

      const location = this.getLocationForMarker(marker);

      if (shouldIgnoreLocation(location)) {
        return;
      }

      const point = this.props.map.latLngToLayerPoint(L.latLng(location));

      L.DomUtil.setPosition(markerElement, point);
    });
  }

  render(): React.Element {
    return (
      <div ref="container"
        className={`leaflet-objects-pane
           leaflet-marker-pane
           leaflet-zoom-hide
           react-leaflet-marker-layer`} >
        {this.renderMarkers()}
      </div>
    );
  }

  renderMarkers(): Array<React.Element> {
    const style = { position: 'absolute' };
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
          map={this.props.map}
          ref={this.getMarkerRefName(index)}
          marker={marker} />
      );
    });
  }

  getMarkerRefName(index: number): string {
    return `marker-${index}`;
  }

}
