'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.foreach');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.pluck');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.min');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.max');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.isnumber');

var _lodash12 = _interopRequireDefault(_lodash11);

var _lodash13 = require('lodash.filter');

var _lodash14 = _interopRequireDefault(_lodash13);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactLeaflet = require('react-leaflet');

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isInvalid(num) {
  return !(0, _lodash12.default)(num) && !num;
}

function isValid(num) {
  return !isInvalid(num);
}

function shouldIgnoreLocation(loc) {
  return isInvalid(loc.lng) || isInvalid(loc.lat);
}

var MarkerLayer = function (_MapLayer) {
  _inherits(MarkerLayer, _MapLayer);

  function MarkerLayer() {
    var _temp, _this, _ret;

    _classCallCheck(this, MarkerLayer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _MapLayer.call.apply(_MapLayer, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  MarkerLayer.prototype.componentWillReceiveProps = function componentWillReceiveProps() {
    // no-op to override MapLayer behavior
  };

  MarkerLayer.prototype.componentDidMount = function componentDidMount() {
    this.leafletElement = _reactDom2.default.findDOMNode(this.refs.container);
    this.props.map.getPanes().overlayPane.appendChild(this.leafletElement);
    if (this.props.fitBoundsOnLoad) {
      this.fitBounds();
    }
    this.attachEvents();
    this.updatePosition();
  };

  MarkerLayer.prototype.componentWillUnmount = function componentWillUnmount() {
    this.props.map.getPanes().overlayPane.removeChild(this.leafletElement);
  };

  MarkerLayer.prototype.fitBounds = function fitBounds() {
    var markers = this.props.markers;
    var lngs = (0, _lodash14.default)((0, _lodash2.default)(markers, this.props.longitudeExtractor), isValid);
    var lats = (0, _lodash14.default)((0, _lodash2.default)(markers, this.props.latitudeExtractor), isValid);
    var ne = { lng: (0, _lodash10.default)(lngs), lat: (0, _lodash10.default)(lats) };
    var sw = { lng: (0, _lodash8.default)(lngs), lat: (0, _lodash8.default)(lats) };

    if (shouldIgnoreLocation(ne) || shouldIgnoreLocation(sw)) {
      return;
    }

    this.props.map.fitBounds(_leaflet2.default.latLngBounds(_leaflet2.default.latLng(sw), _leaflet2.default.latLng(ne)));
  };

  MarkerLayer.prototype.componentDidUpdate = function componentDidUpdate() {
    this.props.map.invalidateSize();
    if (this.props.fitBoundsOnUpdate) {
      this.fitBounds();
    }
    this.updatePosition();
  };

  MarkerLayer.prototype.attachEvents = function attachEvents() {
    var _this2 = this;

    var map = this.props.map;
    map.on('viewreset', function () {
      return _this2.updatePosition();
    });
  };

  MarkerLayer.prototype.getLocationForMarker = function getLocationForMarker(marker) {
    return {
      lat: this.props.latitudeExtractor(marker),
      lng: this.props.longitudeExtractor(marker)
    };
  };

  MarkerLayer.prototype.updatePosition = function updatePosition() {
    var _this3 = this;

    (0, _lodash4.default)(this.props.markers, function (marker, i) {
      var markerElement = _reactDom2.default.findDOMNode(_this3.refs[_this3.getMarkerRefName(i)]);

      var location = _this3.getLocationForMarker(marker);

      if (shouldIgnoreLocation(location)) {
        return;
      }

      var point = _this3.props.map.latLngToLayerPoint(_leaflet2.default.latLng(location));

      _leaflet2.default.DomUtil.setPosition(markerElement, point);
    });
  };

  MarkerLayer.prototype.render = function render() {
    return _react2.default.createElement(
      'div',
      { ref: 'container',
        className: 'leaflet-objects-pane\n           leaflet-marker-pane\n           leaflet-zoom-hide\n           react-leaflet-marker-layer' },
      this.renderMarkers()
    );
  };

  MarkerLayer.prototype.renderMarkers = function renderMarkers() {
    var _this4 = this;

    var style = { position: 'absolute' };
    var MarkerComponent = this.props.markerComponent;
    return (0, _lodash2.default)(this.props.markers, function (marker, index) {
      if (shouldIgnoreLocation(_this4.getLocationForMarker(marker))) {
        return;
      }

      return _react2.default.createElement(MarkerComponent, _extends({}, _this4.props.propsForMarkers, {
        key: index,
        style: style,
        map: _this4.props.map,
        ref: _this4.getMarkerRefName(index),
        marker: marker }));
    });
  };

  MarkerLayer.prototype.getMarkerRefName = function getMarkerRefName(index) {
    return 'marker-' + index;
  };

  return MarkerLayer;
}(_reactLeaflet.MapLayer);

MarkerLayer.propTypes = {
  markers: _react2.default.PropTypes.array,
  longitudeExtractor: _react2.default.PropTypes.func.isRequired,
  latitudeExtractor: _react2.default.PropTypes.func.isRequired,
  markerComponent: _react2.default.PropTypes.func.isRequired,
  propsForMarkers: _react2.default.PropTypes.object,
  fitBoundsOnLoad: _react2.default.PropTypes.bool,
  fitBoundsOnUpdate: _react2.default.PropTypes.bool
};
exports.default = MarkerLayer;
