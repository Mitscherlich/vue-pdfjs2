import _extends from "@babel/runtime/helpers/extends";
import _createClass from "@babel/runtime/helpers/createClass";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";

var _dec, _class;

import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import PageContext from '../PageContext';
import { errorOnDev, getPixelRatio, isCancelException, makePageCallback, dispatchEvents } from '../shared/utils';
import { isRef, isRotate } from '../shared/propTypes';
export var PageCanvasProps = {
  canvasRef: isRef,
  page: PropTypes.any.isRequired,
  renderInteractiveForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number.isRequired
};
var PageCanvasInternal = (_dec = Component({
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
  _inheritsLoose(PageCanvasInternal, _Vue);

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
    dispatchEvents(this, 'rendered render:success renderSuccess', makePageCallback(page, scale));
  }
  /**
   * Called when a page fails to render.
   */
  ;

  _proto.onRenderError = function onRenderError(error) {
    if (isCancelException(error)) {
      return;
    }

    errorOnDev(error);
    dispatchEvents(this, 'error render:error renderError', error);
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

  _createClass(PageCanvasInternal, [{
    key: "renderViewport",
    get: function get() {
      var _this$$props3 = this.$props,
          page = _this$$props3.page,
          rotate = _this$$props3.rotate,
          scale = _this$$props3.scale;
      var pixelRatio = getPixelRatio();
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
}(Vue)) || _class);
var PageCanvas = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(PageContext.Consumer, [function (context) {
      return h(PageCanvasInternal, {
        "props": _extends({}, _extends({}, context, props))
      });
    }]);
  }
};
export default PageCanvas;