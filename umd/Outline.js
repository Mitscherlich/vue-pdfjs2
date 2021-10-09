"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _OutlineContext = _interopRequireDefault(require("./OutlineContext"));

var _OutlineItem = _interopRequireDefault(require("./OutlineItem"));

var _utils = require("./shared/utils");

var _dec, _class;

var OutlinePropTypes = {
  pdf: _vueTypes["default"].any
};
var OutlineInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'Outline',
  props: OutlinePropTypes,
  watch: {
    $props: function $props(props, prevProps) {
      var pdf = props.pdf;

      if (prevProps.pdf && pdf !== prevProps.pdf) {
        this.loadOutline();
      }
    }
  }
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(OutlineInternal, _Vue);

  function OutlineInternal() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Vue.call.apply(_Vue, [this].concat(args)) || this;
    _this.outline = null;
    return _this;
  }

  var _proto = OutlineInternal.prototype;

  _proto.mounted = function mounted() {
    var pdf = this.$props.pdf;

    if (!pdf) {
      throw new Error('Attempted to load an outline, but no document was specified.');
    }

    this.loadOutline();
  };

  _proto.beforeDestroy = function beforeDestroy() {
    (0, _utils.cancelRunningTask)(this.runningTask);
  };

  _proto.loadOutline = function loadOutline() {
    var _this2 = this;

    var pdf = this.$props.pdf;

    if (this.outline) {
      this.outline = null;
    }

    var cancellable = (0, _makeCancellablePromise["default"])(pdf.getOutline());
    this.runningTask = cancellable;
    cancellable.promise.then(function (outline) {
      _this2.setState({
        outline: outline
      }, _this2.onLoadSuccess);
    })["catch"](function (error) {
      _this2.onLoadError(error);
    });
  }
  /**
   * Called when an outline is read successfully
   */
  ;

  _proto.onLoadSuccess = function onLoadSuccess() {
    var outline = this.outline;
    (0, _utils.dispatchEvents)(this, 'loaded load:success LoadSuccess', outline);
  }
  /**
   * Called when an outline failed to read successfully
   */
  ;

  _proto.onLoadError = function onLoadError(error) {
    this.outline = false;
    (0, _utils.errorOnDev)(error);
    (0, _utils.dispatchEvents)(this, 'error load:error LoadError', error);
  };

  _proto.onItemClick = function onItemClick(_ref) {
    var pageIndex = _ref.pageIndex,
        pageNumber = _ref.pageNumber;
    this.$emit('click', {
      pageIndex: pageIndex,
      pageNumber: pageNumber
    });
  };

  _proto.renderOutline = function renderOutline() {
    var h = this.$createElement;
    var outline = this.outline;
    return h("ul", [outline.map(function (item, itemIndex) {
      return h(_OutlineItem["default"], {
        "key": typeof item.destination === 'string' ? item.destination : itemIndex,
        "attrs": {
          "item": item
        }
      });
    })]);
  };

  _proto.render = function render() {
    var h = arguments[0];
    var outline = this.outline,
        pdf = this.pdf;

    if (!pdf || !outline) {
      return null;
    }

    return h("div", {
      "class": "vue-pdf__Outline"
    }, [h(_OutlineContext["default"].Provider, {
      "attrs": {
        "value": this.childContext
      }
    }, [this.renderOutline()])]);
  };

  return OutlineInternal;
}(_vue["default"])) || _class);

function Outline(props) {
  return h(_DocumentContext["default"].Consumer, [function (context) {
    return h(OutlineInternal, {
      "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, context, props))
    });
  }]);
}

var _default = Outline;
exports["default"] = _default;