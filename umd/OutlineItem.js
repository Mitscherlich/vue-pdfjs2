"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _babelHelperVueJsxMergeProps = _interopRequireDefault(require("@vue/babel-helper-vue-jsx-merge-props"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _vue = _interopRequireDefault(require("vue"));

var _vueClassComponent = _interopRequireDefault(require("vue-class-component"));

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _OutlineContext = _interopRequireDefault(require("./OutlineContext"));

var _Ref = _interopRequireDefault(require("./Ref"));

var _utils = require("./shared/utils");

var _excluded = ["item"];

var _dec, _class;

var isDestination = _vueTypes["default"].oneOfType([_vueTypes["default"].string, _vueTypes["default"].arrayOf(_vueTypes["default"].any)]);

var OutlineItemPropTypes = {
  item: _vueTypes["default"].shape({
    dest: isDestination,
    items: _vueTypes["default"].arrayOf(_vueTypes["default"].shape({
      dest: isDestination,
      title: _vueTypes["default"].string
    })),
    title: _vueTypes["default"].string
  }).isRequired,
  onClick: _vueTypes["default"].func,
  pdf: _vueTypes["default"].any.isRequired
};
var OutlineItemInternal = (_dec = (0, _vueClassComponent["default"])({
  name: 'OutlineItem',
  props: OutlineItemPropTypes
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  (0, _inheritsLoose2["default"])(OutlineItemInternal, _Vue);

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

      if (!(0, _utils.isDefined)(_this.destination)) {
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

      if ((0, _utils.isDefined)(_this2.pageIndex)) {
        resolve(_this2.pageIndex);
      }

      _this2.getDestination().then(function (destination) {
        if (!destination) {
          return;
        }

        var ref = destination[0];
        pdf.getPageIndex(new _Ref["default"](ref)).then(resolve)["catch"](reject);
      });
    }).then(function (pageIndex) {
      _this2.pageIndex = pageIndex;
      return _this2.pageIndex;
    });
  };

  _proto.getPageNumber = function getPageNumber() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      if ((0, _utils.isDefined)(_this3.pageNumber)) {
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
        otherProps = (0, _objectWithoutPropertiesLoose2["default"])(_this$$props2, _excluded);

    if (!item.items || !item.items.length) {
      return null;
    }

    var subitems = item.items;
    return h("ul", [subitems.map(function (subitem, subitemIndex) {
      return h(OutlineItemInternal, (0, _babelHelperVueJsxMergeProps["default"])([{
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
}(_vue["default"])) || _class);
var OutlineItem = {
  functional: true,
  render: function render(h, _ref2) {
    var props = _ref2.props;
    return h(_DocumentContext["default"].Consumer, [function (documentContext) {
      return h(_OutlineContext["default"].Consumer, [function (outlineContext) {
        return h(OutlineItemInternal, {
          "props": (0, _extends2["default"])({}, (0, _extends2["default"])({}, documentContext, outlineContext, props))
        });
      }]);
    }]);
  }
};
var _default = OutlineItem;
exports["default"] = _default;