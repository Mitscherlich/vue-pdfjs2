import _extends from "@babel/runtime/helpers/extends";
import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
var _excluded = ["item"];

var _dec, _class;

import Vue from 'vue';
import Component from 'vue-class-component';
import PropTypes from 'vue-types';
import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';
import Ref from './Ref';
import { isDefined } from './shared/utils';
var isDestination = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.any)]);
var OutlineItemPropTypes = {
  item: PropTypes.shape({
    dest: isDestination,
    items: PropTypes.arrayOf(PropTypes.shape({
      dest: isDestination,
      title: PropTypes.string
    })),
    title: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  pdf: PropTypes.any.isRequired
};
var OutlineItemInternal = (_dec = Component({
  name: 'OutlineItem',
  props: OutlineItemPropTypes
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  _inheritsLoose(OutlineItemInternal, _Vue);

  function OutlineItemInternal() {
    return _Vue.apply(this, arguments) || this;
  }

  var _proto = OutlineItemInternal.prototype;

  _proto.getDestination = function getDestination() {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var _this$$props = _this.$props,
          item = _this$$props.item,
          pdf = _this$$props.pdf;

      if (!isDefined(_this.destination)) {
        if (typeof item.dest === 'string') {
          pdf.getDestination(item.dest).then(resolve)["catch"](reject);
        } else {
          resolve(item.dest);
        }
      }

      return _this.destination;
    }).then(function (destination) {
      _this.destination = destination;
      return destination;
    });
  };

  _proto.getPageIndex = function getPageIndex() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      var pdf = _this2.$props.pdf;

      if (isDefined(_this2.pageIndex)) {
        resolve(_this2.pageIndex);
      }

      _this2.getDestination().then(function (destination) {
        if (!destination) {
          return;
        }

        var ref = destination[0];
        pdf.getPageIndex(new Ref(ref)).then(resolve)["catch"](reject);
      });
    }).then(function (pageIndex) {
      _this2.pageIndex = pageIndex;
      return _this2.pageIndex;
    });
  };

  _proto.getPageNumber = function getPageNumber() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      if (isDefined(_this3.pageNumber)) {
        resolve(_this3.pageNumber);
      }

      _this3.getPageIndex().then(function (pageIndex) {
        resolve(pageIndex + 1);
      })["catch"](reject);
    }).then(function (pageNumber) {
      _this3.pageNumber = pageNumber;
      return pageNumber;
    });
  };

  _proto.onClick = function onClick(event) {
    var _this4 = this;

    event.preventDefault();
    return Promise.all([this.getPageIndex(), this.getPageNumber()]).then(function (_ref) {
      var pageIndex = _ref[0],
          pageNumber = _ref[1];

      _this4.$emit('click', {
        pageIndex: pageIndex,
        pageNumber: pageNumber
      });
    });
  };

  _proto.renderSubitems = function renderSubitems() {
    var h = this.$createElement;

    var _this$$props2 = this.$props,
        item = _this$$props2.item,
        otherProps = _objectWithoutPropertiesLoose(_this$$props2, _excluded);

    if (!item.items || !item.items.length) {
      return null;
    }

    var subitems = item.items;
    return h("ul", [subitems.map(function (subitem, subitemIndex) {
      return h(OutlineItemInternal, _mergeJSXProps([{
        "key": typeof subitem.destination === 'string' ? subitem.destination : subitemIndex,
        "attrs": {
          "item": subitem
        }
      }, otherProps]));
    })]);
  };

  _proto.render = function render() {
    var h = arguments[0];
    var item = this.$props.item;
    return h("li", [h("a", {
      "attrs": {
        "href": "#"
      },
      "on": {
        "click": this.onClick
      }
    }, [item.title]), this.renderSubitems()]);
  };

  return OutlineItemInternal;
}(Vue)) || _class);
var OutlineItem = {
  functional: true,
  render: function render(h, _ref2) {
    var props = _ref2.props;
    return h(DocumentContext.Consumer, [function (documentContext) {
      return h(OutlineContext.Consumer, [function (outlineContext) {
        return h(OutlineItemInternal, {
          "props": _extends({}, _extends({}, documentContext, outlineContext, props))
        });
      }]);
    }]);
  }
};
export default OutlineItem;