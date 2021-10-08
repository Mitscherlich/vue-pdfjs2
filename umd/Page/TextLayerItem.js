"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.TextLayerItemProps = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _propTypes = require("../shared/propTypes");

var _dec, _class;

var TextLayerItemProps = {
  customTextRenderer: _vueTypes["default"].func,
  fontName: _vueTypes["default"].string.isRequired,
  itemIndex: _vueTypes["default"].number.isRequired,
  page: _vueTypes["default"].any.isRequired,
  rotate: _propTypes.isRotate,
  scale: _vueTypes["default"].number,
  str: _vueTypes["default"].string.isRequired,
  transform: _vueTypes["default"].arrayOf(_vueTypes["default"].number).isRequired,
  width: _vueTypes["default"].number.isRequired
};
exports.TextLayerItemProps = TextLayerItemProps;
var TextLayerItemInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'TextLayerItem',
  props: TextLayerItemProps
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(TextLayerItemInternal, _Vue);

  function TextLayerItemInternal() {
    return _Vue.apply(this, arguments) || this;
  }

  var _proto = TextLayerItemInternal.prototype;

  _proto.mounted = function mounted() {
    this.alignTextItem();
  };

  _proto.updated = function updated() {
    this.alignTextItem();
  };

  /**
   * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
   * text content.
   */
  _proto.getRotate = function getRotate() {
    var _this$$props = this.$props,
        page = _this$$props.page,
        rotate = _this$$props.rotate;
    return rotate - page.rotate;
  };

  _proto.getFontData = function getFontData(fontName) {
    var page = this.$props.page;
    return new Promise(function (resolve) {
      page.commonObjs.get(fontName, resolve);
    });
  };

  _proto.alignTextItem = function alignTextItem() {
    var _this = this;

    var element = this.$el;

    if (!element || !element.style) {
      return;
    }

    element.style.transform = '';
    var _this$$props2 = this.$props,
        fontName = _this$$props2.fontName,
        scale = _this$$props2.scale,
        width = _this$$props2.width;
    element.style.fontFamily = fontName + ", sans-serif";
    this.getFontData(fontName).then(function (fontData) {
      var fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';
      element.style.fontFamily = fontName + ", " + fallbackFontName;
      var targetWidth = width * scale;

      var actualWidth = _this.getElementWidth(element);

      var transform = "scaleX(" + targetWidth / actualWidth + ")";
      var ascent = fontData ? fontData.ascent : 0;

      if (ascent) {
        transform += " translateY(" + (1 - ascent) * 100 + "%)";
      }

      element.style.transform = transform;
      element.style.WebkitTransform = transform;
    });
  };

  _proto.getElementWidth = function getElementWidth(element) {
    var sideways = this.sideways;
    return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
  };

  _proto.render = function render() {
    var h = arguments[0];
    var fontSize = this.fontSize,
        top = this.top,
        left = this.left,
        customTextRenderer = this.customTextRenderer,
        scale = this.scale,
        text = this.str;
    return h("span", {
      "style": {
        height: '1em',
        fontFamily: 'sans-serif',
        fontSize: fontSize * scale + "px",
        position: 'absolute',
        top: top * scale + "px",
        left: left * scale + "px",
        transformOrigin: 'left bottom',
        whiteSpace: 'pre',
        pointerEvents: 'all'
      }
    }, [customTextRenderer ? customTextRenderer(this.$props) : text]);
  };

  (0, _createClass2["default"])(TextLayerItemInternal, [{
    key: "unRotatedViewport",
    get: function get() {
      var _this$$props3 = this.$props,
          page = _this$$props3.page,
          scale = _this$$props3.scale;
      return page.getViewport({
        scale: scale
      });
    }
  }, {
    key: "sideways",
    get: function get() {
      return this.getRotate() % 180 !== 0;
    }
  }, {
    key: "defaultSideways",
    get: function get() {
      var rotation = this.unRotatedViewport.rotation;
      return rotation % 180 !== 0;
    }
  }, {
    key: "fontSize",
    get: function get() {
      var transform = this.transform,
          defaultSideways = this.defaultSideways;
      var fontHeightPx = transform[0],
          fontWidthPx = transform[1];
      return defaultSideways ? fontWidthPx : fontHeightPx;
    }
  }, {
    key: "top",
    get: function get() {
      var transform = this.transform,
          viewport = this.unRotatedViewport,
          defaultSideways = this.defaultSideways;
      var
      /* fontHeightPx */

      /* fontWidthPx */
      offsetX = transform[2],
          offsetY = transform[3],
          x = transform[4],
          y = transform[5];
      var _viewport$viewBox = viewport.viewBox,

      /* xMin */
      yMin
      /* xMax */
      = _viewport$viewBox[1],
          yMax = _viewport$viewBox[3];
      return defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
    }
  }, {
    key: "left",
    get: function get() {
      var transform = this.transform,
          viewport = this.unRotatedViewport,
          defaultSideways = this.defaultSideways;
      var
      /* fontHeightPx */

      /* fontWidthPx */

      /* offsetX */

      /* offsetY */
      x = transform[4],
          y = transform[5];
      var _viewport$viewBox2 = viewport.viewBox,
          xMin = _viewport$viewBox2[0];
      return defaultSideways ? y - xMin : x - xMin;
    }
  }]);
  return TextLayerItemInternal;
}(_vue["default"])) || _class);
var TextLayerItem = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(_PageContext["default"].Consumer, [function (context) {
      return h(TextLayerItemInternal, {
        "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, context, props))
      });
    }]);
  }
};
var _default = TextLayerItem;
exports["default"] = _default;