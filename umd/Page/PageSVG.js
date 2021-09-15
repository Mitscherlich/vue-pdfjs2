"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.PageSVGProps = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueTypes = _interopRequireDefault(require("../shared/vue-types"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var pdfjs = _interopRequireWildcard(require("pdfjs-dist/legacy/build/pdf"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _utils = require("../shared/utils");

var _propTypes = require("../shared/propTypes");

var _dec, _class;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var PageSVGProps = {
  page: _vueTypes["default"].any.isRequired,
  rotate: _propTypes.isRotate,
  scale: _vueTypes["default"].number.isRequired
};
exports.PageSVGProps = PageSVGProps;
var PageSVGInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'PageSVG',
  props: PageSVGProps
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(PageSVGInternal, _Vue);

  function PageSVGInternal() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Vue.call.apply(_Vue, [this].concat(args)) || this;
    _this.svg = null;
    return _this;
  }

  var _proto = PageSVGInternal.prototype;

  _proto.mounted = function mounted() {
    this.drawPageOnContainer();
    this.renderSVG();
  }
  /**
   * Called when a page is rendered successfully.
   */
  ;

  _proto.onRenderSuccess = function onRenderSuccess() {
    this.renderer = null;
    var _this$$props = this.$props,
        page = _this$$props.page,
        scale = _this$$props.scale;
    (0, _utils.dispatchEvents)(this, 'rendered render:success renderSuccess', (0, _utils.makePageCallback)(page, scale));
  }
  /**
   * Called when a page fails to render.
   */
  ;

  _proto.onRenderError = function onRenderError(error) {
    if ((0, _utils.isCancelException)(error)) {
      return;
    }

    (0, _utils.errorOnDev)(error);
    (0, _utils.dispatchEvents)(this, 'error render:error renderError', error);
  };

  _proto.renderSVG = /*#__PURE__*/function () {
    var _renderSVG = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var page, svgGfx;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              page = this.$props.page;
              this.renderer = page.getOperatorList();
              _context.prev = 2;
              _context.next = 5;
              return this.renderer();

            case 5:
              svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
              _context.next = 8;
              return svgGfx.getSVG(operatorList, this.viewport);

            case 8:
              this.svg = _context.sent;
              this.onRenderSuccess();
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](2);
              this.onRenderError(_context.t0);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 12]]);
    }));

    function renderSVG() {
      return _renderSVG.apply(this, arguments);
    }

    return renderSVG;
  }();

  _proto.drawPageOnContainer = function drawPageOnContainer(element) {
    if (element === void 0) {
      element = this.$el;
    }

    var svg = this.svg;

    if (!element || !svg) {
      return;
    } // Append SVG element to the main container, if this hasn't been done already


    if (!element.firstElementChild) {
      element.appendChild(svg);
    }

    var _this$viewport = this.viewport,
        width = _this$viewport.width,
        height = _this$viewport.height;
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  };

  _proto.render = function render() {
    var h = arguments[0];
    var _this$viewport2 = this.viewport,
        width = _this$viewport2.width,
        height = _this$viewport2.height;
    return h("div", {
      "class": "vue-pdf__Page__svg",
      "style": {
        display: 'block',
        backgroundColor: 'white',
        overflow: 'hidden',
        width: width,
        height: height,
        userSelect: 'none'
      }
    });
  };

  (0, _createClass2["default"])(PageSVGInternal, [{
    key: "viewport",
    get: function get() {
      var _this$$props2 = this.$props,
          page = _this$$props2.page,
          rotate = _this$$props2.rotate,
          scale = _this$$props2.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }]);
  return PageSVGInternal;
}(_vue["default"])) || _class);
var PageSVG = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(_PageContext["default"].Consumer, {
      "attrs": {
        "customRender": function customRender(context) {
          return h(PageSVGInternal, {
            "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, context, props))
          });
        }
      }
    });
  }
};
var _default = PageSVG;
exports["default"] = _default;