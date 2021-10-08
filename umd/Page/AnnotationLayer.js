"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.AnnotationLayerProps = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var pdfjs = _interopRequireWildcard(require("pdfjs-dist/legacy/build/pdf"));

var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));

var _DocumentContext = _interopRequireDefault(require("../DocumentContext"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _utils = require("../shared/utils");

var _propTypes = require("../shared/propTypes");

var _dec, _class;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AnnotationLayerProps = {
  imageResourcesPath: _vueTypes["default"].string,
  linkService: _propTypes.isLinkService.isRequired,
  page: _vueTypes["default"].any,
  renderInteractiveForms: _vueTypes["default"].bool,
  rotate: _propTypes.isRotate,
  scale: _vueTypes["default"].number
};
exports.AnnotationLayerProps = AnnotationLayerProps;
var AnnotationLayerInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'AnnotationLayer',
  props: AnnotationLayerProps,
  watch: {
    $props: function $props(props, prevProps) {
      var page = props.page,
          renderInteractiveForms = props.renderInteractiveForms;

      if (prevProps.page && page !== prevProps.page || renderInteractiveForms !== prevProps.renderInteractiveForms) {
        this.loadAnnotations();
      }
    }
  }
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(AnnotationLayerInternal, _Vue);

  function AnnotationLayerInternal() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Vue.call.apply(_Vue, [this].concat(args)) || this;
    _this.annotations = null;
    return _this;
  }

  var _proto = AnnotationLayerInternal.prototype;

  _proto.mounted = function mounted() {
    var page = this.$props.page;

    if (!page) {
      throw new Error('Attempted to load page annotations, but no page was specified.');
    }

    this.annotationLayer = this.$el;
    this.loadAnnotations();
  };

  _proto.beforeDestroy = function beforeDestroy() {
    (0, _utils.cancelRunningTask)(this.runningTask);
  };

  _proto.loadAnnotations = /*#__PURE__*/function () {
    var _loadAnnotations = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var page, cancellable;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              page = this.$props.page;
              cancellable = (0, _makeCancellablePromise["default"])(page.getAnnotations());
              this.runningTask = cancellable;
              _context.prev = 3;
              _context.next = 6;
              return cancellable.promise;

            case 6:
              this.annotations = _context.sent;
              this.onLoadSuccess();
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              this.onLoadError(_context.t0);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 10]]);
    }));

    function loadAnnotations() {
      return _loadAnnotations.apply(this, arguments);
    }

    return loadAnnotations;
  }();

  _proto.onLoadSuccess = function onLoadSuccess() {
    var annotations = this.annotations;
    (0, _utils.dispatchEvents)(this, 'loaded annotations:loaded GetAnnotationsSuccess', annotations);
  };

  _proto.onLoadError = function onLoadError(error) {
    this.annotations = false;
    (0, _utils.errorOnDev)(error);
    (0, _utils.dispatchEvents)(this, 'error annotations:error GetAnnotationsError', error);
  };

  _proto.onRenderSuccess = function onRenderSuccess() {
    (0, _utils.dispatchEvents)(this, 'rendered annotations:rendered RenderAnnotationLayerSuccess');
  }
  /**
   * Called when a annotations fails to render.
   */
  ;

  _proto.onRenderError = function onRenderError(error) {
    (0, _utils.errorOnDev)(error);
    (0, _utils.dispatchEvents)(this, 'error annotations:error RenderAnnotationLayerError');
  };

  _proto.renderAnnotationLayer = function renderAnnotationLayer() {
    var annotations = this.annotations;

    if (!annotations) {
      return;
    }

    var _this$$props = this.$props,
        imageResourcesPath = _this$$props.imageResourcesPath,
        linkService = _this$$props.linkService,
        page = _this$$props.page,
        renderInteractiveForms = _this$$props.renderInteractiveForms;
    var viewport = this.viewport.clone({
      dontFlip: true
    });
    var parameters = {
      annotations: annotations,
      div: this.annotationLayer,
      imageResourcesPath: imageResourcesPath,
      linkService: linkService,
      page: page,
      renderInteractiveForms: renderInteractiveForms,
      viewport: viewport
    };
    this.annotationLayer.innerHTML = '';

    try {
      pdfjs.AnnotationLayer.render(parameters);
      this.onRenderSuccess();
    } catch (error) {
      this.onRenderError(error);
    }
  };

  _proto.render = function render() {
    var h = arguments[0];
    return h("div", {
      "class": "vue-pdf__Page__annotations annotationLayer"
    }, [this.renderAnnotationLayer()]);
  };

  (0, _createClass2["default"])(AnnotationLayerInternal, [{
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
  return AnnotationLayerInternal;
}(_vue["default"])) || _class);
var AnnotationLayer = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(_DocumentContext["default"].Consumer, [function (documentContext) {
      return h(_PageContext["default"].Consumer, [function (pageContext) {
        return h(AnnotationLayerInternal, {
          "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, documentContext, pageContext, props))
        });
      }]);
    }]);
  }
};
var _default = AnnotationLayer;
exports["default"] = _default;