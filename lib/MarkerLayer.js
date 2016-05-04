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

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MarkerLayer = function (_MapLayer) {
  _inherits(MarkerLayer, _MapLayer);

  function MarkerLayer() {
    _classCallCheck(this, MarkerLayer);

    return _possibleConstructorReturn(this, _MapLayer.apply(this, arguments));
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
    var lngs = (0, _lodash2.default)(markers, this.props.longitudeExtractor);
    var lats = (0, _lodash2.default)(markers, this.props.latitudeExtractor);
    var ne = { lng: (0, _lodash10.default)(lngs), lat: (0, _lodash10.default)(lats) };
    var sw = { lng: (0, _lodash8.default)(lngs), lat: (0, _lodash8.default)(lats) };
    this.props.map.fitBounds(_leaflet2.default.latLngBounds(_leaflet2.default.latLng(sw), _leaflet2.default.latLng(ne)));
  };

  MarkerLayer.prototype.componentDidUpdate = function componentDidUpdate() {
    this.props.map.invalidateSize();
    this.updatePosition();
  };

  MarkerLayer.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
    return true;
  };

  MarkerLayer.prototype.attachEvents = function attachEvents() {
    var _this2 = this;

    var map = this.props.map;
    map.on('viewreset', function () {
      return _this2.updatePosition();
    });
  };

  MarkerLayer.prototype.updatePosition = function updatePosition() {
    var _this3 = this;

    (0, _lodash4.default)(this.props.markers, function (marker, i) {
      var markerElement = _reactDom2.default.findDOMNode(_this3.refs[_this3.getMarkerRefName(i)]);

      var point = _this3.props.map.latLngToLayerPoint(_leaflet2.default.latLng({
        lat: _this3.props.latitudeExtractor(marker),
        lng: _this3.props.longitudeExtractor(marker)
      }));

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
  fitBoundsOnLoad: _react2.default.PropTypes.bool
};
exports.default = MarkerLayer;
