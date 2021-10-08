import _extends from "@babel/runtime/helpers/extends";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _createClass from "@babel/runtime/helpers/createClass";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";

var _dec, _class;

import _regeneratorRuntime from "@babel/runtime/regenerator";
import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import makeCancellable from 'make-cancellable-promise';
import PageContext from '../PageContext';
import TextLayerItem from './TextLayerItem';
import { cancelRunningTask, errorOnDev, dispatchEvents } from '../shared/utils';
import { isRotate } from '../shared/propTypes';
export var TextLayerProps = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  page: PropTypes.any.isRequired,
  rotate: isRotate,
  scale: PropTypes.number
};
var TextLayerInternal = (_dec = Component({
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
  _inheritsLoose(TextLayerInternal, _Vue);

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
    cancelRunningTask(this.runningTask);
  };

  _proto.loadTextItems = /*#__PURE__*/function () {
    var _loadTextItems = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var page, cancellable, _yield$cancellable$pr, textItems;

      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              page = this.$props.page;
              cancellable = makeCancellable(page.getTextContent());
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
    dispatchEvents(this, 'loaded text:loaded getTextSuccess', textItems);
  };

  _proto.onLoadError = function onLoadError(error) {
    this.textItems = false;
    errorOnDev(error);
    dispatchEvents(this, 'error text:error getTextError', error);
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
      return h(TextLayerItem, {
        "key": itemIndex,
        "props": _extends({}, _extends({}, textItem, {
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

  _createClass(TextLayerInternal, [{
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
}(Vue)) || _class);
var TextLayer = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props;
    return h(PageContext.Consumer, [function (context) {
      return h(TextLayerInternal, {
        "props": _extends({}, _extends({}, context, props))
      });
    }]);
  }
};
export default TextLayer;