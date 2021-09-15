import _extends from "@babel/runtime/helpers/extends";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _createClass from "@babel/runtime/helpers/createClass";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";

var _dec, _class;

import _regeneratorRuntime from "@babel/runtime/regenerator";
import Vue from 'vue';
import Component from 'vue-class-component';
import PropTypes from './shared/vue-types';
import makeCancellable from 'make-cancellable-promise';
import DocumentContext from './DocumentContext';
import PageContext from './PageContext';
import Message from './Message';
import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';
import { cancelRunningTask, errorOnDev, isProvided, makePageCallback, dispatchEvents } from './shared/utils';
import { isRenderMode, isRotate } from './shared/propTypes';
var defaultScale = 1;
var PageProps = {
  customTextRenderer: PropTypes.func,
  error: PropTypes.any.def('Failed to load the page.'),
  height: PropTypes.number,
  imageResourcesPath: PropTypes.string,
  loading: PropTypes.any.def('Loading page…'),
  noData: PropTypes.any.def('No page specified.'),
  pageIndex: PropTypes.any,
  pageNumber: PropTypes.any,
  pdf: PropTypes.any,
  registerPage: PropTypes.func,
  renderAnnotation: PropTypes.bool.def(true),
  renderInteractiveForms: PropTypes.bool.def(false),
  renderMode: isRenderMode.def('canvas'),
  renderTextLayer: PropTypes.bool.def(true),
  rotate: isRotate,
  scale: PropTypes.number.def(defaultScale),
  unregisterPage: PropTypes.func,
  width: PropTypes.number
};
var PageInternal = (_dec = Component({
  name: 'Page',
  props: PageProps,
  watch: {
    $props: function $props(props, prevProps) {
      var pdf = props.pdf;

      if (prevProps.pdf && pdf !== prevProps.pdf || this.getPageNumber() !== this.getPageNumber(prevProps)) {
        var unregisterPage = props.unregisterPage;

        if (unregisterPage) {
          unregisterPage(this.getPageIndex(prevProps));
        }

        this.loadPage();
      }
    }
  }
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  _inheritsLoose(PageInternal, _Vue);

  function PageInternal() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Vue.call.apply(_Vue, [this].concat(args)) || this;
    _this.page = null;
    return _this;
  }

  var _proto = PageInternal.prototype;

  _proto.mounted = function mounted() {
    if (!this.pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    this.loadPage();
  };

  _proto.beforeDestroy = function beforeDestroy() {
    var unregisterPage = this.$props.unregisterPage;

    if (unregisterPage) {
      unregisterPage(this.getPageIndex());
    }

    cancelRunningTask(this.runningTask);
  };

  /**
   * Called when a page is loaded successfully
   */
  _proto.onLoadSuccess = function onLoadSuccess() {
    var page = this.page,
        registerPage = this.registerPage;
    dispatchEvents(this, 'loaded load:success', makePageCallback(page, this.getScale()));

    if (registerPage) {
      registerPage(this.pageIndex, this.$refs.pageRef);
    }
  }
  /**
   * Called when a page failed to load
   */
  ;

  _proto.onLoadError = function onLoadError(error) {
    errorOnDev(error);
    dispatchEvents(this, 'error load:error', error);
  };

  _proto.getPageIndex = function getPageIndex(props) {
    if (props === void 0) {
      props = this.$props;
    }

    if (isProvided(props.pageNumber)) {
      return props.pageNumber - 1;
    }

    if (isProvided(props.pageIndex)) {
      return props.pageIndex;
    }

    return null;
  };

  _proto.getPageNumber = function getPageNumber(props) {
    if (props === void 0) {
      props = this.$props;
    }

    if (isProvided(props.pageNumber)) {
      return props.pageNumber;
    }

    if (isProvided(props.pageIndex)) {
      return props.pageIndex + 1;
    }

    return null;
  };

  _proto.getRotate = function getRotate() {
    var rotate = this.$props.rotate;

    if (isProvided(rotate)) {
      return rotate;
    }

    var page = this.page;

    if (!page) {
      return null;
    }

    return page.rotate;
  };

  _proto.getScale = function getScale() {
    var page = this.page;

    if (!page) {
      return null;
    }

    var _this$$props = this.$props,
        scale = _this$$props.scale,
        width = _this$$props.width,
        height = _this$$props.height;
    var rotate = this.rotate; // Be default, we'll render page at 100% * scale width.

    var pageScale = 1; // Passing scale explicitly null would cause the page not to render

    var scaleWithDefault = scale === null ? defaultScale : scale; // If width/height is defined, calculate the scale of the page so it could be of desired width.

    if (width || height) {
      var viewport = page.getViewport({
        scale: 1,
        rotation: rotate
      });
      pageScale = width ? width / viewport.width : height / viewport.height;
    }

    return scaleWithDefault * pageScale;
  };

  _proto.loadPage = /*#__PURE__*/function () {
    var _loadPage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var pdf, pageNumber, cancellable;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              pdf = this.$props.pdf;
              pageNumber = this.getPageNumber();

              if (pageNumber) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return");

            case 4:
              if (this.page) {
                this.page = null;
              }

              cancellable = makeCancellable(pdf.getPage(pageNumber));
              this.runningTask = cancellable;
              _context.prev = 7;
              _context.next = 10;
              return cancellable.promise;

            case 10:
              this.page = _context.sent;
              this.onLoadSuccess();
              _context.next = 18;
              break;

            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](7);
              this.page = false;
              this.onLoadError(_context.t0);

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[7, 14]]);
    }));

    function loadPage() {
      return _loadPage.apply(this, arguments);
    }

    return loadPage;
  }();

  _proto.genMainLayer = function genMainLayer() {
    var h = this.$createElement;
    var renderMode = this.$props.renderMode;

    switch (renderMode) {
      case 'none':
        return null;

      case 'svg':
        return h(PageSVG, {
          "key": this.pageKeyNoScale + "_svg",
          "attrs": {
            "page": this.page
          }
        });

      case 'canvas':
      default:
        return h(PageCanvas, {
          "key": this.pageKey + "_canvas",
          "attrs": {
            "page": this.page,
            "scale": this.getScale()
          }
        });
    }
  };

  _proto.genTextLayer = function genTextLayer() {
    var h = this.$createElement;
    var renderTextLayer = this.$props.renderTextLayer;

    if (!renderTextLayer) {
      return null;
    }

    return h(TextLayer, {
      "key": this.pageKey + "_text",
      "attrs": {
        "page": this.page
      }
    });
  };

  _proto.genAnnotationLayer = function genAnnotationLayer() {
    var h = this.$createElement;
    var renderAnnotation = this.$props.renderAnnotation;

    if (!renderAnnotation) {
      return null;
    }
    /**
     * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
     * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
     */


    return h(AnnotationLayer, {
      "key": this.pageKey + "_annotations",
      "attrs": {
        "page": this.page
      }
    });
  };

  _proto.renderChildren = function renderChildren() {
    var h = this.$createElement;
    return h(PageContext.Provider, {
      "attrs": {
        "value": this.childContext
      }
    }, [this.genMainLayer(), this.genTextLayer(), this.genAnnotationLayer(), this.$slots['default']]);
  };

  _proto.renderContent = function renderContent() {
    var h = this.$createElement;
    var page = this.page,
        pageNumber = this.pageNumber,
        pdf = this.pdf;

    if (!pageNumber) {
      var noData = this.$props.noData;
      return h(Message, {
        "attrs": {
          "type": "no-data"
        }
      }, [typeof noData === 'function' ? noData() : noData]);
    }

    if (pdf === null || page === null) {
      var loading = this.$props.loading;
      return h(Message, {
        "attrs": {
          "type": "loading"
        }
      }, [typeof loading === 'function' ? loading() : loading]);
    }

    if (pdf === false || page === false) {
      var error = this.$props.error;
      return h(Message, {
        "attrs": {
          "type": "error"
        }
      }, [typeof error === 'function' ? error() : error]);
    }

    return this.renderChildren();
  };

  _proto.render = function render() {
    var h = arguments[0];
    var pageNumber = this.pageNumber;
    return h("div", {
      "class": "vue-pdf__Page",
      "attrs": {
        "data-page-number": pageNumber
      },
      "ref": "pageRef",
      "style": "position: relative"
    }, [this.renderContent()]);
  };

  _createClass(PageInternal, [{
    key: "childContext",
    get: function get() {
      var page = this.page;

      if (!page) {
        return {};
      }

      var _this$$props2 = this.$props,
          customTextRenderer = _this$$props2.customTextRenderer,
          renderInteractiveForms = _this$$props2.renderInteractiveForms;
      return {
        customTextRenderer: customTextRenderer,
        page: page,
        renderInteractiveForms: renderInteractiveForms,
        rotate: this.getRotate(),
        scale: this.getScale()
      };
    }
  }, {
    key: "pageKey",
    get: function get() {
      return this.page.pageIndex + "@" + this.getScale() + "/" + this.getRotate();
    }
  }, {
    key: "pageKeyNoScale",
    get: function get() {
      return this.page.pageIndex + "/" + this.getRotate();
    }
  }]);

  return PageInternal;
}(Vue)) || _class);
var Page = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(DocumentContext.Consumer, {
      "attrs": {
        "customRender": function customRender(context) {
          return h(PageInternal, {
            "props": _extends({}, _extends({}, context, props))
          });
        }
      }
    });
  }
};
export default Page;