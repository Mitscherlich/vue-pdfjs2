"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.TextLayerProps = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueTypes = _interopRequireDefault(require("../shared/vue-types"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _TextLayerItem = _interopRequireDefault(require("./TextLayerItem"));

var _utils = require("../shared/utils");

var _propTypes = require("../shared/propTypes");

var _dec, _class;

var TextLayerProps = {
  onGetTextError: _vueTypes["default"].func,
  onGetTextSuccess: _vueTypes["default"].func,
  page: _vueTypes["default"].any.isRequired,
  rotate: _propTypes.isRotate,
  scale: _vueTypes["default"].number
};
exports.TextLayerProps = TextLayerProps;
var TextLayerInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'TextLayer',
  props: TextLayerProps,
  watch: {
    $props: function $props(props, prevProps) {
      var page = props.page;

      if (prevProps.page && page !== prevProps.page) {
        this.loadTextItems();
      }
    }
  }
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(TextLayerInternal, _Vue);

  function TextLayerInternal() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Vue.call.apply(_Vue, [this].concat(args)) || this;
    _this.textItems = null;
    return _this;
  }

  var _proto = TextLayerInternal.prototype;

  _proto.mounted = function mounted() {
    var page = this.$props.page;

    if (!page) {
      throw new Error('Attempted to load page text content, but no page was specified.');
    }

    this.loadTextItems();
  };

  _proto.beforeDestroy = function beforeDestroy() {
    (0, _utils.cancelRunningTask)(this.runningTask);
  };

  _proto.loadTextItems = /*#__PURE__*/function () {
    var _loadTextItems = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var page, cancellable, _yield$cancellable$pr, textItems;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              page = this.$props.page;
              cancellable = (0, _makeCancellablePromise["default"])(page.getTextContent());
              this.runningTask = cancellable;
              _context.prev = 3;
              _context.next = 6;
              return cancellable.promise;

            case 6:
              _yield$cancellable$pr = _context.sent;
              textItems = _yield$cancellable$pr.items;
              this.textItems = textItems;
              this.onLoadSuccess();
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](3);
              this.onLoadError(_context.t0);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 12]]);
    }));

    function loadTextItems() {
      return _loadTextItems.apply(this, arguments);
    }

    return loadTextItems;
  }();

  _proto.onLoadSuccess = function onLoadSuccess() {
    var textItems = this.textItems;
    (0, _utils.dispatchEvents)(this, 'loaded text:loaded getTextSuccess', textItems);
  };

  _proto.onLoadError = function onLoadError(error) {
    this.textItems = false;
    (0, _utils.errorOnDev)(error);
    (0, _utils.dispatchEvents)(this, 'error text:error getTextError', error);
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

  _proto.renderTextItems = function renderTextItems() {
    var h = this.$createElement;
    var textItems = this.textItems;

    if (!textItems) {
      return null;
    }

    return textItems.map(function (textItem, itemIndex) {
      return h(_TextLayerItem["default"], {
        "key": itemIndex,
        "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, textItem, {
          itemIndex: itemIndex
        }))
      });
    });
  };

  _proto.render = function render() {
    var h = arguments[0];

    if (!this.page) {
      return null;
    }

    var viewport = this.unRotatedViewport;
    var rotate = this.getRotate();
    return h("div", {
      "class": "vue-pdf__Page__textContent",
      "style": {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: viewport.width + "px",
        height: viewport.height + "px",
        color: 'transparent',
        transform: "translate(-50%, -50%) rotate(" + rotate + "deg)",
        WebkitTransform: "translate(-50%, -50%) rotate(" + rotate + "deg)",
        pointerEvents: 'none'
      }
    }, [this.renderTextItems()]);
  };

  (0, _createClass2["default"])(TextLayerInternal, [{
    key: "unRotatedViewport",
    get: function get() {
      var _this$$props2 = this.$props,
          page = _this$$props2.page,
          scale = _this$$props2.scale;
      return page.getViewport({
        scale: scale
      });
    }
  }]);
  return TextLayerInternal;
}(_vue["default"])) || _class);
var TextLayer = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(_PageContext["default"].Consumer, {
      "attrs": {
        "customRender": function customRender(context) {
          return h(TextLayerInternal, {
            "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, context, props))
          });
        }
      }
    });
  }
};
var _default = TextLayer;
exports["default"] = _default;