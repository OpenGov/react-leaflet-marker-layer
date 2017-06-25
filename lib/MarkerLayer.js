'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _min = require('lodash/min');

var _min2 = _interopRequireDefault(_min);

var _max = require('lodash/max');

var _max2 = _interopRequireDefault(_max);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isInvalid(num) {
  return !(0, _isNumber2.default)(num) && !num;
}

function isValid(num) {
  return !isInvalid(num);
}

function shouldIgnoreLocation(loc) {
  return isInvalid(loc.lng) || isInvalid(loc.lat);
}

var MarkerLayer = function (_MapLayer) {
  _inherits(MarkerLayer, _MapLayer);

  function MarkerLayer(props, context) {
    _classCallCheck(this, MarkerLayer);

    var _this = _possibleConstructorReturn(this, _MapLayer.call(this, props, context));

    _this.map = null;
    _this.markers = {};
    _this.container = null;

    _this.map = undefined !== props.map ? props.map : context.map;
    return _this;
  }

  MarkerLayer.prototype.createLeafletElement = function createLeafletElement(props) {
    return null;
  };

  MarkerLayer.prototype.componentWillReceiveProps = function componentWillReceiveProps() {
    // no-op to override MapLayer behavior
  };

  MarkerLayer.prototype.componentDidMount = function componentDidMount() {
    this.leafletElement = _reactDom2.default.findDOMNode(this.container);
    this.map.getPanes().overlayPane.appendChild(this.leafletElement);
    if (this.props.fitBoundsOnLoad) {
      this.fitBounds();
    }
    this.attachEvents();
    this.updatePosition();
  };

  MarkerLayer.prototype.componentWillUnmount = function componentWillUnmount() {
    this.map.getPanes().overlayPane.removeChild(this.leafletElement);
  };

  MarkerLayer.prototype.fitBounds = function fitBounds() {
    var markers = this.props.markers;
    var lngs = (0, _filter2.default)((0, _map2.default)(markers, this.props.longitudeExtractor), isValid);
    var lats = (0, _filter2.default)((0, _map2.default)(markers, this.props.latitudeExtractor), isValid);
    var ne = { lng: (0, _max2.default)(lngs), lat: (0, _max2.default)(lats) };
    var sw = { lng: (0, _min2.default)(lngs), lat: (0, _min2.default)(lats) };

    if (shouldIgnoreLocation(ne) || shouldIgnoreLocation(sw)) {
      return;
    }

    this.map.fitBounds(_leaflet2.default.latLngBounds(_leaflet2.default.latLng(sw), _leaflet2.default.latLng(ne)));
  };

  MarkerLayer.prototype.markersOrPositionExtractorsChanged = function markersOrPositionExtractorsChanged(props) {
    return this.props.markers !== props.markers || this.props.longitudeExtractor !== props.longitudeExtractor || this.props.latitudeExtractor !== props.latitudeExtractor;
  };

  MarkerLayer.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    this.map.invalidateSize();
    if (this.props.fitBoundsOnUpdate && this.markersOrPositionExtractorsChanged(prevProps)) {
      this.fitBounds();
    }
    this.updatePosition();
  };

  MarkerLayer.prototype.attachEvents = function attachEvents() {
    this.map.on('zoomend', this.updatePosition.bind(this));
    this.map.on('viewreset', this.updatePosition.bind(this));
  };

  MarkerLayer.prototype.getLocationForMarker = function getLocationForMarker(marker) {
    return {
      lat: this.props.latitudeExtractor(marker),
      lng: this.props.longitudeExtractor(marker)
    };
  };

  MarkerLayer.prototype.updatePosition = function updatePosition() {
    var _this2 = this;

    (0, _forEach2.default)(this.props.markers, function (marker, i) {
      var markerComponent = _this2.markers[_this2.getMarkerRefName(i)];

      if (!markerComponent || !markerComponent.ref) {
        throw new Error('Missing reference: Please add a reference to your Marker element, by adding \'ref={(c) => this.ref = c}\' to your marker\'s root tag');
      }

      var markerElement = _reactDom2.default.findDOMNode(markerComponent.ref);

      var location = _this2.getLocationForMarker(marker);

      if (!markerElement || shouldIgnoreLocation(location)) {
        return;
      }

      var point = _this2.map.latLngToLayerPoint(_leaflet2.default.latLng(location));

      _leaflet2.default.DomUtil.setPosition(markerElement, point);
    });
  };

  MarkerLayer.prototype.render = function render() {
    var _this3 = this;

    return _react2.default.createElement(
      'div',
      { ref: function ref(c) {
          return _this3.container = c;
        },
        className: 'leaflet-objects-pane\n           leaflet-marker-pane\n           leaflet-zoom-hide\n           react-leaflet-marker-layer' },
      this.renderMarkers()
    );
  };

  MarkerLayer.prototype.renderMarkers = function renderMarkers() {
    var _this4 = this;

    var style = { position: 'absolute' };
    var MarkerComponent = this.props.markerComponent;
    return (0, _map2.default)(this.props.markers, function (marker, index) {
      if (shouldIgnoreLocation(_this4.getLocationForMarker(marker))) {
        return;
      }

      return _react2.default.createElement(MarkerComponent, _extends({}, _this4.props.propsForMarkers, {
        key: index,
        style: style,
        map: _this4.map,
        ref: function ref(c) {
          return _this4.markers[_this4.getMarkerRefName(index)] = c;
        },
        marker: marker }));
    });
  };

  MarkerLayer.prototype.getMarkerRefName = function getMarkerRefName(index) {
    return 'marker-' + index;
  };

  return MarkerLayer;
}(_reactLeaflet.MapLayer);

MarkerLayer.propTypes = {
  markers: _propTypes2.default.array,
  longitudeExtractor: _propTypes2.default.func.isRequired,
  latitudeExtractor: _propTypes2.default.func.isRequired,
  markerComponent: _propTypes2.default.func.isRequired,
  propsForMarkers: _propTypes2.default.object,
  fitBoundsOnLoad: _propTypes2.default.bool,
  fitBoundsOnUpdate: _propTypes2.default.bool
};
exports.default = MarkerLayer;
