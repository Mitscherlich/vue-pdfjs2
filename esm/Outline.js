import _extends from "@babel/runtime/helpers/extends";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";

var _dec, _class;

import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import makeCancellable from 'make-cancellable-promise';
import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';
import OutlineItem from './OutlineItem';
import { cancelRunningTask, errorOnDev, dispatchEvents } from './shared/utils';
var OutlinePropTypes = {
  pdf: PropTypes.any
};
var OutlineInternal = (_dec = Component({
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
  _inheritsLoose(OutlineInternal, _Vue);

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
    cancelRunningTask(this.runningTask);
  };

  _proto.loadOutline = function loadOutline() {
    var _this2 = this;

    var pdf = this.$props.pdf;

    if (this.outline) {
      this.outline = null;
    }

    var cancellable = makeCancellable(pdf.getOutline());
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
    dispatchEvents(this, 'loaded load:success LoadSuccess', outline);
  }
  /**
   * Called when an outline failed to read successfully
   */
  ;

  _proto.onLoadError = function onLoadError(error) {
    this.outline = false;
    errorOnDev(error);
    dispatchEvents(this, 'error load:error LoadError', error);
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
      return h(OutlineItem, {
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
    }, [h(OutlineContext.Provider, {
      "attrs": {
        "value": this.childContext
      }
    }, [this.renderOutline()])]);
  };

  return OutlineInternal;
}(Vue)) || _class);

function Outline(props) {
  return h(DocumentContext.Consumer, [function (context) {
    return h(OutlineInternal, {
      "props": _extends({}, _extends({}, context, props))
    });
  }]);
}

export default Outline;