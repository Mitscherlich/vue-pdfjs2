"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _PageContext = _interopRequireDefault(require("./PageContext"));

var _Message = _interopRequireDefault(require("./Message"));

var _PageCanvas = _interopRequireDefault(require("./Page/PageCanvas"));

var _PageSVG = _interopRequireDefault(require("./Page/PageSVG"));

var _TextLayer = _interopRequireDefault(require("./Page/TextLayer"));

var _AnnotationLayer = _interopRequireDefault(require("./Page/AnnotationLayer"));

var _utils = require("./shared/utils");

var _propTypes = require("./shared/propTypes");

var _dec, _class;

var defaultScale = 1;
var PageProps = {
  customTextRenderer: _vueTypes["default"].func,
  error: _vueTypes["default"].any.def('Failed to load the page.'),
  height: _vueTypes["default"].number,
  imageResourcesPath: _vueTypes["default"].string,
  loading: _vueTypes["default"].any.def('Loading page…'),
  noData: _vueTypes["default"].any.def('No page specified.'),
  pageIndex: _vueTypes["default"].any,
  pageNumber: _vueTypes["default"].any,
  pdf: _vueTypes["default"].any,
  registerPage: _vueTypes["default"].func,
  renderAnnotation: _vueTypes["default"].bool.def(true),
  renderInteractiveForms: _vueTypes["default"].bool.def(false),
  renderMode: _propTypes.isRenderMode.def('canvas'),
  renderTextLayer: _vueTypes["default"].bool.def(true),
  rotate: _propTypes.isRotate,
  scale: _vueTypes["default"].number.def(defaultScale),
  unregisterPage: _vueTypes["default"].func,
  width: _vueTypes["default"].number
};
var PageInternal = (_dec = (0, _vueClassComponent["default"])({
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
  (0, _inheritsLoose2["default"])(PageInternal, _Vue);

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

    (0, _utils.cancelRunningTask)(this.runningTask);
  };

  /**
   * Called when a page is loaded successfully
   */
  _proto.onLoadSuccess = function onLoadSuccess() {
    var page = this.page,
        registerPage = this.registerPage;
    (0, _utils.dispatchEvents)(this, 'loaded load:success', (0, _utils.makePageCallback)(page, this.getScale()));

    if (registerPage) {
      registerPage(this.pageIndex, this.$refs.pageRef);
    }
  }
  /**
   * Called when a page failed to load
   */
  ;

  _proto.onLoadError = function onLoadError(error) {
    (0, _utils.errorOnDev)(error);
    (0, _utils.dispatchEvents)(this, 'error load:error', error);
  };

  _proto.getPageIndex = function getPageIndex(props) {
    if (props === void 0) {
      props = this.$props;
    }

    if ((0, _utils.isProvided)(props.pageNumber)) {
      return props.pageNumber - 1;
    }

    if ((0, _utils.isProvided)(props.pageIndex)) {
      return props.pageIndex;
    }

    return null;
  };

  _proto.getPageNumber = function getPageNumber(props) {
    if (props === void 0) {
      props = this.$props;
    }

    if ((0, _utils.isProvided)(props.pageNumber)) {
      return props.pageNumber;
    }

    if ((0, _utils.isProvided)(props.pageIndex)) {
      return props.pageIndex + 1;
    }

    return null;
  };

  _proto.getRotate = function getRotate() {
    var rotate = this.$props.rotate;

    if ((0, _utils.isProvided)(rotate)) {
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
    var _loadPage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var pdf, pageNumber, cancellable;
      return _regenerator["default"].wrap(function _callee$(_context) {
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

              cancellable = (0, _makeCancellablePromise["default"])(pdf.getPage(pageNumber));
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
        return h(_PageSVG["default"], {
          "key": this.pageKeyNoScale + "_svg",
          "attrs": {
            "page": this.page
          }
        });

      case 'canvas':
      default:
        return h(_PageCanvas["default"], {
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

    return h(_TextLayer["default"], {
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


    return h(_AnnotationLayer["default"], {
      "key": this.pageKey + "_annotations",
      "attrs": {
        "page": this.page
      }
    });
  };

  _proto.renderChildren = function renderChildren() {
    var h = this.$createElement;
    return h(_PageContext["default"].Provider, {
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
      return h(_Message["default"], {
        "attrs": {
          "type": "no-data"
        }
      }, [typeof noData === 'function' ? noData() : noData]);
    }

    if (pdf === null || page === null) {
      var loading = this.$props.loading;
      return h(_Message["default"], {
        "attrs": {
          "type": "loading"
        }
      }, [typeof loading === 'function' ? loading() : loading]);
    }

    if (pdf === false || page === false) {
      var error = this.$props.error;
      return h(_Message["default"], {
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

  (0, _createClass2["default"])(PageInternal, [{
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
}(_vue["default"])) || _class);
var Page = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(_DocumentContext["default"].Consumer, [function (context) {
      return h(PageInternal, {
        "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, context, props))
      });
    }]);
  }
};
var _default = Page;
exports["default"] = _default;