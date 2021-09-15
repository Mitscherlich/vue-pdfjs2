import _extends from "@babel/runtime/helpers/extends";
import PropTypes from './vue-types';
export var createContext = function createContext(defaultValue) {
  var _contextValue = function _contextValue() {
    return defaultValue instanceof Object ? _extends({}, defaultValue) : defaultValue;
  };

  return {
    Provider: {
      name: 'Context.Provider',
      props: {
        value: PropTypes.any,
        tag: PropTypes.string.def('div')
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
        customRender: PropTypes.func.isRequired
      },
      render: function render(_h, _ref) {
        var props = _ref.props;
        return props.customRender(_contextValue());
      }
    }
  };
};