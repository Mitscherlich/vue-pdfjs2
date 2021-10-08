import _extends from "@babel/runtime/helpers/extends";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _createClass from "@babel/runtime/helpers/createClass";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";

var _dec, _class;

import _regeneratorRuntime from "@babel/runtime/regenerator";
import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import makeCancellable from 'make-cancellable-promise';
import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';
import { cancelRunningTask, errorOnDev, dispatchEvents } from '../shared/utils';
import { isLinkService, isRotate } from '../shared/propTypes';
export var AnnotationLayerProps = {
  imageResourcesPath: PropTypes.string,
  linkService: isLinkService.isRequired,
  page: PropTypes.any,
  renderInteractiveForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number
};
var AnnotationLayerInternal = (_dec = Component({
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
  _inheritsLoose(AnnotationLayerInternal, _Vue);

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
    cancelRunningTask(this.runningTask);
  };

  _proto.loadAnnotations = /*#__PURE__*/function () {
    var _loadAnnotations = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var page, cancellable;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              page = this.$props.page;
              cancellable = makeCancellable(page.getAnnotations());
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
    dispatchEvents(this, 'loaded annotations:loaded GetAnnotationsSuccess', annotations);
  };

  _proto.onLoadError = function onLoadError(error) {
    this.annotations = false;
    errorOnDev(error);
    dispatchEvents(this, 'error annotations:error GetAnnotationsError', error);
  };

  _proto.onRenderSuccess = function onRenderSuccess() {
    dispatchEvents(this, 'rendered annotations:rendered RenderAnnotationLayerSuccess');
  }
  /**
   * Called when a annotations fails to render.
   */
  ;

  _proto.onRenderError = function onRenderError(error) {
    errorOnDev(error);
    dispatchEvents(this, 'error annotations:error RenderAnnotationLayerError');
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

  _createClass(AnnotationLayerInternal, [{
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
}(Vue)) || _class);
var AnnotationLayer = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(DocumentContext.Consumer, [function (documentContext) {
      return h(PageContext.Consumer, [function (pageContext) {
        return h(AnnotationLayerInternal, {
          "props": _extends({}, _extends({}, documentContext, pageContext, props))
        });
      }]);
    }]);
  }
};
export default AnnotationLayer;