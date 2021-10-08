"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.PageCanvasProps = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _utils = require("../shared/utils");

var _propTypes = require("../shared/propTypes");

var _dec, _class;

var PageCanvasProps = {
  canvasRef: _propTypes.isRef,
  page: _vueTypes["default"].any.isRequired,
  renderInteractiveForms: _vueTypes["default"].bool,
  rotate: _propTypes.isRotate,
  scale: _vueTypes["default"].number.isRequired
};
exports.PageCanvasProps = PageCanvasProps;
var PageCanvasInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'PageCanvas',
  props: PageCanvasProps,
  watch: {
    $props: function $props(props, prevProps) {
      var page = props.page,
          renderInteractiveForms = props.renderInteractiveForms;

      if (renderInteractiveForms !== prevProps.renderInteractiveForms) {
        // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
        page.cleanup();
        this.drawPageOnCanvas();
      }
    }
  }
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(PageCanvasInternal, _Vue);

  function PageCanvasInternal() {
    return _Vue.apply(this, arguments) || this;
  }

  var _proto = PageCanvasInternal.prototype;

  _proto.mounted = function mounted() {
    this.canvasLayer = this.$el;
    this.drawPageOnCanvas();
  };

  _proto.beforeDestroy = function beforeDestroy() {
    this.cancelRenderingTask();
    /**
     * Zeroing the width and height cause most browsers to release graphics
     * resources immediately, which can greatly reduce memory consumption.
     */

    if (this.canvasLayer) {
      this.canvasLayer.width = 0;
      this.canvasLayer.height = 0;
      this.canvasLayer = null;
    }
  };

  _proto.cancelRenderingTask = function cancelRenderingTask() {
    if (this.renderer) {
      this.renderer.cancel();
      this.renderer = null;
    }
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

  _proto.drawPageOnCanvas = function drawPageOnCanvas() {
    if (!this.page) {
      return null;
    }

    var canvas = this.canvasLayer;

    if (!canvas) {
      return null;
    }

    var renderViewport = this.renderViewport,
        viewport = this.viewport;
    var _this$$props2 = this.$props,
        page = _this$$props2.page,
        renderInteractiveForms = _this$$props2.renderInteractiveForms;
    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    var renderContext = {
      get canvasContext() {
        return canvas.getContext('2d');
      },

      viewport: renderViewport,
      renderInteractiveForms: renderInteractiveForms
    }; // If another render is in progress, let's cancel it

    this.cancelRenderingTask();
    this.renderer = page.render(renderContext);
    return this.renderer.promise.then(this.onRenderSuccess)["catch"](this.onRenderError);
  };

  _proto.render = function render() {
    var h = arguments[0];
    return h("canvas", {
      "class": "vue-pdf__Page__canvas",
      "attrs": {
        "dir": "ltr"
      },
      "style": {
        display: 'block',
        userSelect: 'none'
      }
    });
  };

  (0, _createClass2["default"])(PageCanvasInternal, [{
    key: "renderViewport",
    get: function get() {
      var _this$$props3 = this.$props,
          page = _this$$props3.page,
          rotate = _this$$props3.rotate,
          scale = _this$$props3.scale;
      var pixelRatio = (0, _utils.getPixelRatio)();
      return page.getViewport({
        scale: scale * pixelRatio,
        rotation: rotate
      });
    }
  }, {
    key: "viewport",
    get: function get() {
      var _this$$props4 = this.$props,
          page = _this$$props4.page,
          rotate = _this$$props4.rotate,
          scale = _this$$props4.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }]);
  return PageCanvasInternal;
}(_vue["default"])) || _class);
var PageCanvas = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(_PageContext["default"].Consumer, [function (context) {
      return h(PageCanvasInternal, {
        "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, context, props))
      });
    }]);
  }
};
var _default = PageCanvas;
exports["default"] = _default;