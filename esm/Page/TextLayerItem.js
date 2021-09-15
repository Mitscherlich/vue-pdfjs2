import _extends from "@babel/runtime/helpers/extends";
import _createClass from "@babel/runtime/helpers/createClass";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";

var _dec, _class;

import Vue from 'vue';
import PropTypes from '../shared/vue-types';
import Component from 'vue-class-component';
import PageContext from '../PageContext';
import { isRotate } from '../shared/propTypes';
export var TextLayerItemProps = {
  customTextRenderer: PropTypes.func,
  fontName: PropTypes.string.isRequired,
  itemIndex: PropTypes.number.isRequired,
  page: PropTypes.any.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
  str: PropTypes.string.isRequired,
  transform: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number.isRequired
};
var TextLayerItemInternal = (_dec = Component({
  name: 'TextLayerItem',
  props: TextLayerItemProps
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  _inheritsLoose(TextLayerItemInternal, _Vue);

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

  _createClass(TextLayerItemInternal, [{
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
}(Vue)) || _class);
var TextLayerItem = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(PageContext.Consumer, {
      "attrs": {
        "customRender": function customRender(context) {
          return h(TextLayerItemInternal, {
            "props": _extends({}, _extends({}, context, props))
          });
        }
      }
    });
  }
};
export default TextLayerItem;