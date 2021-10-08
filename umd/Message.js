"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.MessageProps = void 0;

var _vueTypes = _interopRequireDefault(require("vue-types"));

var MessageProps = {
  type: _vueTypes["default"].oneOf(['error', 'loading', 'no-data']).isRequired
};
exports.MessageProps = MessageProps;
var Message = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props,
        children = _ref.children;
    var type = props.type;
    return h("div", {
      "class": "vue-pdf__message vue-pdf__message--" + type
    }, [children]);
  }
};
var _default = Message;
exports["default"] = _default;