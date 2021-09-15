"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _vueTypes = _interopRequireDefault(require("./vue-types"));

var createContext = function createContext(defaultValue) {
  var _contextValue = function _contextValue() {
    return defaultValue instanceof Object ? (0, _extends2["default"])({}, defaultValue) : defaultValue;
  };

  return {
    Provider: {
      name: 'Context.Provider',
      props: {
        value: _vueTypes["default"].any,
        tag: _vueTypes["default"].string.def('div')
      },
      watch: {
        value: {
          immediate: true,
          handler: function handler(newVal) {
            _contextValue = function _contextValue() {
              return newVal;
            };
          },
          deep: true
        }
      },
      render: function render(h) {
        return h(this.tag, this.$slots['default']);
      }
    },
    Consumer: {
      name: 'Context.Consumer',
      functional: true,
      props: {
        customRender: _vueTypes["default"].func.isRequired
      },
      render: function render(_h, _ref) {
        var props = _ref.props;
        return props.customRender(_contextValue());
      }
    }
  };
};

exports.createContext = createContext;