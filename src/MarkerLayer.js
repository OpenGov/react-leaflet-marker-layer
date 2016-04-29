import React from 'react';
import ReactDOM from 'react-dom';
import map from 'lodash.map';
import forEach from 'lodash.foreach';
import pluck from 'lodash.pluck';
import min from 'lodash.min';
import max from 'lodash.max';
import L from 'leaflet';
import { MapLayer } from 'react-leaflet';

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

export default class MarkerLayer extends MapLayer {
  static propTypes = {
    markers: React.PropTypes.array,
    longitudeExtractor: React.PropTypes.func.isRequired,
    latitudeExtractor: React.PropTypes.func.isRequired,
    markerComponent: React.PropTypes.func.isRequired,
    propsForMarkers: React.PropTypes.object,
    fitBoundsOnLoad: React.PropTypes.bool
  };

  componentDidMount(): void {
    if (this.props.fitBoundsOnLoad) {
      this.fitBounds();
    }
    this.attachEvents();
    this.updatePosition();
  }

  componentWillUnmount(): void {
  }

  fitBounds(): void {
    const markers = this.props.markers;
    const lngs = map(markers, this.props.longitudeExtractor);
    const lats = map(markers, this.props.latitudeExtractor);
    const ne = { lng: max(lngs), lat: max(lats) };
    const sw = { lng: min(lngs), lat: min(lats) };
    this.props.map.fitBounds(L.latLngBounds(L.latLng(sw), L.latLng(ne)));
  }

  componentDidUpdate(): void {
    this.props.map.invalidateSize();
    this.updatePosition();
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  attachEvents(): void {
    const map: Map = this.props.map;
    map.on('viewreset', () => this.updatePosition());
  }

  updatePosition(): void {
    forEach(this.props.markers, (marker, i) => {
      const markerElement = ReactDOM.findDOMNode(
        this.refs[this.getMarkerRefName(i)]
      );

      const point = this.props.map.latLngToLayerPoint(
        L.latLng({
          lat: this.props.latitudeExtractor(marker),
          lng: this.props.longitudeExtractor(marker)
        })
      );

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
    return map(this.props.markers, (marker, index: number) => (
        <MarkerComponent
          {...this.props.propsForMarkers}
          key={index}
          style={style}
          map={this.props.map}
          ref={this.getMarkerRefName(index)}
          marker={marker} />
      ));
  }

  getMarkerRefName(index: number): string {
    return `marker-${index}`;
  }

}
