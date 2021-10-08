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
import PageContext from '../PageContext';
import { errorOnDev, isCancelException, makePageCallback, dispatchEvents } from '../shared/utils';
import { isRotate } from '../shared/propTypes';
export var PageSVGProps = {
  page: PropTypes.any.isRequired,
  rotate: isRotate,
  scale: PropTypes.number.isRequired
};
var PageSVGInternal = (_dec = Component({
  name: 'PageSVG',
  props: PageSVGProps
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  _inheritsLoose(PageSVGInternal, _Vue);

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

  _proto.renderSVG = /*#__PURE__*/function () {
    var _renderSVG = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var page, svgGfx;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
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

  _createClass(PageSVGInternal, [{
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
}(Vue)) || _class);
var PageSVG = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(PageContext.Consumer, [function (context) {
      return h(PageSVGInternal, {
        "props": _extends({}, _extends({}, context, props))
      });
    }]);
  }
};
export default PageSVG;